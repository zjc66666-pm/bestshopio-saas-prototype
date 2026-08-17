/*
 * Static-prototype route manifest.
 *
 * index.html stays a deliberately small SPA shell.  This manifest is the
 * single inventory of independently implementable pages: the static hash
 * route, the current prototype source, and the corresponding Next.js Pages
 * Router destination.  The `render` callbacks are intentionally thin
 * adapters for the prototype runtime; business UI belongs in page modules.
 */
(function () {
  'use strict';

  function ops(method, parts) {
    return function (root) {
      var service = window.SAAS_OPS || {};
      if (typeof service[method] === 'function') service[method](root, parts || []);
    };
  }

  function system(method) {
    return function () {
      var pages = window.SAAS_SYSTEM_PAGES || {};
      if (typeof pages[method] === 'function') pages[method]();
    };
  }

  var routes = [
    { id: 'action-center', prototypeSource: 'js/ops.js#home', nextRoute: 'pages/index.tsx', targetModule: 'src/pages/saas-operations-overview', render: ops('home') },
    { id: 'tasks', prototypeSource: 'js/ops.js#task', nextRoute: 'pages/tasks/[taskId].tsx', targetModule: 'src/pages/saas-operation-task', render: function (root, parts) { ops('task', parts && parts[1])(root); } },
    { id: 'stores', prototypeSource: 'js/ops.js#stores', nextRoute: 'pages/stores/[[...parts]].tsx', targetModule: 'src/pages/saas-stores', render: function (root, parts) { ops('stores', (parts || []).slice(1))(root); } },
    { id: 'organizations', prototypeSource: 'js/ops.js#organizations', nextRoute: 'pages/organizations/[[...parts]].tsx', targetModule: 'src/pages/saas-organizations', render: function (root, parts) { ops('organizations', (parts || []).slice(1))(root); } },
    { id: 'content', prototypeSource: 'js/pages/content/index.js', nextRoute: 'pages/content/index.tsx', targetModule: 'src/pages/saas-help-center', render: function (root, parts) { ops('content', (parts || []).slice(1))(root); } },
    { id: 'domains', prototypeSource: 'js/ops.js#domains', nextRoute: 'pages/domains/[[...parts]].tsx', targetModule: 'src/pages/saas-domains', render: function (root, parts) { ops('domains', (parts || []).slice(1))(root); } },
    { id: 'integrations', prototypeSource: 'js/ops.js#integrations', nextRoute: 'pages/integrations/[[...parts]].tsx', targetModule: 'src/pages/saas-integrations', render: function (root, parts) { ops('integrations', (parts || []).slice(1))(root); } },
    { id: 'plans', prototypeSource: 'js/ops.js#plans', nextRoute: 'pages/plans/[[...parts]].tsx', targetModule: 'src/pages/saas-plans', render: function (root, parts) { ops('plans', (parts || []).slice(1))(root); } },
    { id: 'governance', prototypeSource: 'js/ops.js#governance', nextRoute: 'pages/governance/[[...parts]].tsx', targetModule: 'src/pages/saas-release-management', render: function (root, parts) { ops('governance', (parts || []).slice(1))(root); } },
    { id: 'account', prototypeSource: 'js/app.js#viewAccount', nextRoute: 'pages/account/index.tsx', targetModule: 'src/pages/saas-account', render: system('account') },
    { id: 'menu', prototypeSource: 'js/app.js#viewMenu', nextRoute: 'pages/menu/index.tsx', targetModule: 'src/pages/saas-menu', render: system('menu') },
    { id: 'category', prototypeSource: 'js/app.js#viewCategory', nextRoute: 'pages/category/index.tsx', targetModule: 'src/pages/saas-category', render: system('category') },
    { id: 'attribution', prototypeSource: 'js/attribution.js', nextRoute: 'pages/attribution/[[...parts]].tsx', targetModule: 'src/pages/saas-attribution', render: function (root, parts) { if (typeof window.__viewAttribution === 'function') window.__viewAttribution(root, (parts || []).slice(1)); } },
    { id: 'bestcheckout', prototypeSource: 'js/ops.js#bestcheckout', nextRoute: 'pages/bestcheckout/[[...parts]].tsx', targetModule: 'src/pages/saas-bestcheckout-operations', render: function (root, parts) { ops('bestcheckout', (parts || []).slice(1))(root); } }
  ];

  function find(id) {
    return routes.filter(function (route) { return route.id === id; })[0] || null;
  }

  window.SAAS_PAGE_MANIFEST = {
    routes: routes,
    find: find
  };
})();
