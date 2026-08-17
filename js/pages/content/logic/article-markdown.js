/* Article body parsing and outline rendering. Kept outside page components so
 * the same authored content can be rendered in a public Help Center later. */
(function () {
  'use strict';

  function esc(value) {
    var api = (window.SAAS_OPS || {}).contentApi || {};
    return api.esc ? api.esc(value) : String(value == null ? '' : value);
  }

  function articleText(article) {
    if (article && Object.prototype.hasOwnProperty.call(article, 'body')) return String(article.body || '');
    return '## Before you start\n\nThis guide helps merchants complete the required setup safely.\n\n## Complete the setup\n\nUse the steps in the relevant backend, then return here if you need more help.';
  }

  function outlineFromText(body) {
    var used = {};
    var entries = [];
    String(body || '').split(/\r?\n/).forEach(function (line) {
      var match = /^(#{2,3})\s+(.+?)\s*#*$/.exec(line.trim());
      if (!match) return;
      var title = match[2].replace(/[`*_]/g, '').trim();
      var base = title.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-').replace(/^-+|-+$/g, '') || 'section';
      used[base] = (used[base] || 0) + 1;
      entries.push({ level: match[1].length, title: title, id: 'outline-' + base + (used[base] > 1 ? '-' + used[base] : '') });
    });
    return entries;
  }

  function renderArticleMarkup(body) {
    var outline = outlineFromText(body);
    var heading = 0;
    var paragraph = [];
    var list = [];
    var html = '';
    function flushParagraph() {
      if (!paragraph.length) return;
      html += '<p>' + paragraph.join(' ') + '</p>';
      paragraph = [];
    }
    function flushList() {
      if (!list.length) return;
      html += '<ul>' + list.map(function (item) { return '<li>' + item + '</li>'; }).join('') + '</ul>';
      list = [];
    }
    String(body || '').split(/\r?\n/).forEach(function (raw) {
      var line = raw.trim();
      var headingMatch = /^(#{2,3})\s+(.+?)\s*#*$/.exec(line);
      if (headingMatch) {
        flushParagraph();
        flushList();
        var entry = outline[heading++] || { level: headingMatch[1].length, title: headingMatch[2], id: 'outline-section-' + heading };
        html += '<h' + entry.level + ' data-heading-id="' + esc(entry.id) + '">' + esc(entry.title) + '</h' + entry.level + '>';
      } else if (/^[-*]\s+/.test(line)) {
        flushParagraph();
        list.push(esc(line.replace(/^[-*]\s+/, '')));
      } else if (!line) {
        flushParagraph();
        flushList();
      } else {
        flushList();
        paragraph.push(esc(line));
      }
    });
    flushParagraph();
    flushList();
    return html || '<p class="ops-meta">This article has no body content yet.</p>';
  }

  function outlineMarkup(outline, interactive) {
    if (!outline.length) return '<div class="ops-outline-empty">Use H2 (##) and H3 (###) headings in the article body to build this outline automatically.</div>';
    return '<div class="ops-outline-list">' + outline.map(function (entry) {
      var cls = 'ops-outline-item level-' + entry.level;
      return interactive ? '<button type="button" class="' + cls + ' i18n-skip" data-outline-target="' + esc(entry.id) + '">' + esc(entry.title) + '</button>' : '<span class="' + cls + ' i18n-skip">' + esc(entry.title) + '</span>';
    }).join('') + '</div>';
  }

  function bindOutlineLinks(scope) {
    scope.querySelectorAll('[data-outline-target]').forEach(function (button) {
      button.onclick = function () {
        var target = scope.querySelector('[data-heading-id="' + button.getAttribute('data-outline-target') + '"]');
        if (target && target.scrollIntoView) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      };
    });
  }

  window.SAAS_CONTENT_MARKDOWN = {
    articleText: articleText,
    outlineFromText: outlineFromText,
    renderArticleMarkup: renderArticleMarkup,
    outlineMarkup: outlineMarkup,
    bindOutlineLinks: bindOutlineLinks
  };
})();
