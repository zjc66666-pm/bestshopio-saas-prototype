/* BestShopio Platform Center - mock data.
   V1.145 Menu models the store-admin sidebar source of truth:
   - menu_level/type still controls the tree depth.
   - navGroup controls where the item appears: Main / Channel / App.
   - Settings stays as a fixed lower-left entry in Store Admin; no placement config is exposed.
   UI copy English-only, no emoji. */
window.DATA = (function () {
  const menuSchema = {
    navGroups: [
      { value: 'main', label: 'Main', meaning: 'Core commerce modules shown at the top of Store Admin.' },
      { value: 'channel', label: 'Channel', meaning: 'Sales/marketing channels such as Online store, Meta and Google.' },
      { value: 'app', label: 'App', meaning: 'Pluggable apps, shown only when enabled for the store.' },
    ],
  };

  // ---- Menu + permission tree for V1.145 Store Admin sidebar ----
  const menuTree = [
    { id: 2, title: 'Orders', route: '/admin/orders', sort: 100, type: 'menu', navGroup: 'main', permissions: [
      { id: 201, menu_id: 2, title: 'View orders', route: 'orders:view_orders' },
      { id: 202, menu_id: 2, title: 'Shipping', route: 'orders:shipping' },
      { id: 203, menu_id: 2, title: 'Edit shipping address', route: 'orders:edit_shipping_address' },
      { id: 204, menu_id: 2, title: 'Refund', route: 'orders:refund' } ] },
    { id: 3, title: 'Products', route: '/admin/products', sort: 90, type: 'menu', navGroup: 'main', children: [
      { id: 31, title: 'Collections', route: '/admin/products/collections', sort: 80, type: 'submenu', navGroup: 'main', permissions: [
        { id: 301, menu_id: 31, title: 'Collection list', route: 'products:collections:list' },
        { id: 302, menu_id: 31, title: 'Add collection', route: 'products:collections:add' } ] },
      { id: 32, title: 'Reviews', route: '/admin/products/reviews', sort: 70, type: 'submenu', navGroup: 'main', permissions: [
        { id: 303, menu_id: 32, title: 'Review list', route: 'products:reviews:list' } ] } ] },
    { id: 4, title: 'Customers', route: '/admin/customers', sort: 80, type: 'menu', navGroup: 'main' },
    { id: 5, title: 'Discounts', route: '/admin/discount', sort: 70, type: 'menu', navGroup: 'main' },
    { id: 8, title: 'Content', route: '/admin/content/blog', sort: 60, type: 'menu', navGroup: 'main', children: [
      { id: 81, title: 'Blog', route: '/admin/content/blog', sort: 60, type: 'submenu', navGroup: 'main' },
      { id: 82, title: 'Page', route: '/admin/content/page', sort: 50, type: 'submenu', navGroup: 'main' },
      { id: 83, title: 'Menu', route: '/admin/content/menu', sort: 40, type: 'submenu', navGroup: 'main' } ] },
    { id: 9, title: 'Online store', route: '/admin/channels/online-store', sort: 50, type: 'menu', navGroup: 'channel' },
    { id: 10, title: 'Meta', route: '/admin/channels/meta', sort: 45, type: 'menu', navGroup: 'channel', permissions: [
      { id: 1001, menu_id: 10, title: 'Edit Meta tracking', route: 'channels:meta:tracking:update' } ] },
    { id: 11, title: 'Google', route: '/admin/channels/google/products', sort: 40, type: 'menu', navGroup: 'channel', permissions: [
      { id: 1101, menu_id: 11, title: 'Edit Google tracking', route: 'channels:google:tracking:update' },
      { id: 1102, menu_id: 11, title: 'Product sync settings', route: 'channels:google:products:update' } ] },
    { id: 12, title: 'BestCheckout', route: '/admin/apps/bestcheckout', sort: 30, type: 'menu', navGroup: 'app' },
  ];

  // ---- Settings menu context. Store Admin opens this after clicking the fixed Settings entry. ----
  const settingsMenuTree = [
    { id: 2001, title: 'Basic settings', route: '/admin/settings/base', sort: 100, type: 'menu', navGroup: 'settings_context', permissions: [
      { id: 200101, menu_id: 2001, title: 'View basic settings', route: 'settings:base:view' },
      { id: 200102, menu_id: 2001, title: 'Edit basic settings', route: 'settings:base:update' } ] },
    { id: 2002, title: 'Payments', route: '/admin/settings/payments', sort: 90, type: 'menu', navGroup: 'settings_context', permissions: [
      { id: 200201, menu_id: 2002, title: 'View payments', route: 'settings:payments:view' },
      { id: 200202, menu_id: 2002, title: 'Edit payments', route: 'settings:payments:update' } ] },
    { id: 2003, title: 'Currency', route: '/admin/settings/currency', sort: 80, type: 'menu', navGroup: 'settings_context' },
    { id: 2004, title: 'Checkout', route: '/admin/settings/checkout', sort: 70, type: 'menu', navGroup: 'settings_context' },
    { id: 2005, title: 'Metafields', route: '/admin/settings/metafields', sort: 60, type: 'menu', navGroup: 'settings_context' },
    { id: 2006, title: 'Ship locations', route: '/admin/settings/shippable-locations', sort: 50, type: 'menu', navGroup: 'settings_context' },
    { id: 2007, title: 'Shipping rates', route: '/admin/settings/shipping-rates', sort: 40, type: 'menu', navGroup: 'settings_context' },
    { id: 2008, title: 'Staff and permissions', route: '/admin/settings/roles', sort: 30, type: 'menu', navGroup: 'settings_context', children: [
      { id: 20081, title: 'Roles', route: '/admin/settings/roles', sort: 20, type: 'submenu', navGroup: 'settings_context', permissions: [
        { id: 200811, menu_id: 20081, title: 'View roles', route: 'settings:roles:view' },
        { id: 200812, menu_id: 20081, title: 'Add role', route: 'settings:roles:add' },
        { id: 200813, menu_id: 20081, title: 'Edit role', route: 'settings:roles:update' },
        { id: 200814, menu_id: 20081, title: 'Delete role', route: 'settings:roles:delete' } ] },
      { id: 20082, title: 'Staff', route: '/admin/settings/staff', sort: 10, type: 'submenu', navGroup: 'settings_context', permissions: [
        { id: 200821, menu_id: 20082, title: 'View staff', route: 'settings:staff:view' },
        { id: 200822, menu_id: 20082, title: 'Invite staff', route: 'settings:staff:invite' },
        { id: 200823, menu_id: 20082, title: 'Edit staff', route: 'settings:staff:update' },
        { id: 200824, menu_id: 20082, title: 'Delete staff', route: 'settings:staff:delete' } ] } ] },
  ];

  // Expected Store Admin sidebar after Store backend groups menu records and Store Admin pins Settings to the bottom.
  // Use this as QA's fixture when wiring /sys/store/navigation/sidebar.
  const expectedStoreAdminSidebar = {
    main: [
      { key: 'orders', title: 'Orders', route: '/admin/orders' },
      { key: 'products', title: 'Products', route: '/admin/products', children: [
        { key: 'product_collections', title: 'Collections', route: '/admin/products/collections' },
        { key: 'product_reviews', title: 'Reviews', route: '/admin/products/reviews' },
      ] },
      { key: 'customers', title: 'Customers', route: '/admin/customers' },
      { key: 'discounts', title: 'Discounts', route: '/admin/discount' },
      { key: 'content', title: 'Content', route: '/admin/content/blog', children: [
        { key: 'content_blog', title: 'Blog', route: '/admin/content/blog' },
        { key: 'content_page', title: 'Page', route: '/admin/content/page' },
        { key: 'storefront_menu', title: 'Menu', route: '/admin/content/menu' },
      ] },
    ],
    channel: [
      { key: 'online_store', title: 'Online store', route: '/admin/channels/online-store' },
      { key: 'meta', title: 'Meta', route: '/admin/channels/meta' },
      { key: 'google', title: 'Google', route: '/admin/channels/google/products' },
    ],
    app: [
      { key: 'bestcheckout', title: 'BestCheckout', route: '/admin/apps/bestcheckout' },
    ],
    settingsContext: [
      { key: 'settings_base', title: 'Basic settings', route: '/admin/settings/base' },
      { key: 'settings_payments', title: 'Payments', route: '/admin/settings/payments' },
      { key: 'settings_currency', title: 'Currency', route: '/admin/settings/currency' },
      { key: 'settings_checkout', title: 'Checkout', route: '/admin/settings/checkout' },
      { key: 'settings_metafields', title: 'Metafields', route: '/admin/settings/metafields' },
      { key: 'settings_ship_locations', title: 'Ship locations', route: '/admin/settings/shippable-locations' },
      { key: 'settings_shipping_rates', title: 'Shipping rates', route: '/admin/settings/shipping-rates' },
      { key: 'settings_staff_permissions', title: 'Staff and permissions', route: '/admin/settings/roles', children: [
        { key: 'settings_roles', title: 'Roles', route: '/admin/settings/roles' },
        { key: 'settings_staff', title: 'Staff', route: '/admin/settings/staff' },
      ] },
    ],
  };

  // Store Roles should read this combined tree: main sidebar + settings menu context.
  const rolePermissionTree = [
    { context: 'main_sidebar', title: 'Main sidebar', children: menuTree },
    { context: 'settings_menu', title: 'Settings menu', children: settingsMenuTree },
  ];

  // ---- Account x store access (V1.129) ----
  const accounts = [
    { account: 'ryan@bestvoy.com', storeText: 'silixwear, lovocross, folast, minilizm', status: 'Access granted' },
    { account: 'ops.amy@bestvoy.com', storeText: 'silixwear, lovocross', status: 'Access granted' },
    { account: 'data.lee@bestvoy.com', storeText: 'All stores', status: 'Access granted' },
    { account: 'mark@bestvoy.com', storeText: '- -', status: 'No access' },
    { account: 'support.kim@bestvoy.com', storeText: 'minilizm', status: 'Access granted' },
    { account: 'intern.zoe@bestvoy.com', storeText: '- -', status: 'No access' },
  ];

  // ---- Platform category tree (V1.134) ----
  const categories = [
    { id: 1, name: 'Apparel', platformId: 'cat_apparel', level: 1, children: [
      { id: 11, name: 'Leggings', platformId: 'cat_leggings', level: 2 },
      { id: 12, name: 'Tops', platformId: 'cat_tops', level: 2 },
      { id: 13, name: 'Outerwear', platformId: 'cat_outerwear', level: 2 } ] },
    { id: 2, name: 'Beauty', platformId: 'cat_beauty', level: 1, children: [
      { id: 21, name: 'Skincare', platformId: 'cat_skincare', level: 2 },
      { id: 22, name: 'Makeup', platformId: 'cat_makeup', level: 2 } ] },
    { id: 3, name: 'Home & Living', platformId: 'cat_home', level: 1, children: [
      { id: 31, name: 'Kitchen', platformId: 'cat_kitchen', level: 2 },
      { id: 32, name: 'Decor', platformId: 'cat_decor', level: 2 } ] },
    { id: 4, name: 'Electronics', platformId: 'cat_electronics', level: 1 },
    { id: 5, name: 'Accessories', platformId: 'cat_accessories', level: 1 },
  ];

  // ---- Attribution rules (V1.140) — consumed by the data warehouse ----
  // Domain dictionary = dim_referrer_domain. match: exact_host | registered_domain | prefix_wildcard
  const domains = [
    // exclude — own + payment gateway + OAuth return
    { domain: 'silixwear.com', match: 'registered_domain', type: 'exclude', platform: '', note: 'Own store domain', updatedAt: 'Jun 12' },
    { domain: 'lovocross.com', match: 'registered_domain', type: 'exclude', platform: '', note: 'Own store domain', updatedAt: 'Jun 12' },
    { domain: 'paypal.com', match: 'registered_domain', type: 'exclude', platform: '', note: 'Payment redirect', updatedAt: 'Jun 12' },
    { domain: 'checkout.stripe.com', match: 'exact_host', type: 'exclude', platform: '', note: 'Hosted checkout', updatedAt: 'Jun 12' },
    { domain: 'accounts.google.com', match: 'exact_host', type: 'exclude', platform: '', note: 'OAuth return', updatedAt: 'Jun 12' },
    // social
    { domain: 'facebook.com', match: 'registered_domain', type: 'social', platform: 'facebook', note: 'Covers m./l./lm. subdomains', updatedAt: 'Jun 13' },
    { domain: 'instagram.com', match: 'registered_domain', type: 'social', platform: 'instagram', note: '', updatedAt: 'Jun 13' },
    { domain: 't.co', match: 'registered_domain', type: 'social', platform: 'x', note: 'X short-link', updatedAt: 'Jun 13' },
    { domain: 'tiktok.com', match: 'registered_domain', type: 'social', platform: 'tiktok', note: '', updatedAt: 'Jun 11' },
    { domain: 'youtube.com', match: 'registered_domain', type: 'social', platform: 'youtube', note: '', updatedAt: 'Jun 11' },
    { domain: 'pinterest.*', match: 'prefix_wildcard', type: 'social', platform: 'pinterest', note: 'Country TLDs', updatedAt: 'Jun 11' },
    // search
    { domain: 'google.*', match: 'prefix_wildcard', type: 'search', platform: '', note: 'All country TLDs', updatedAt: 'Jun 10' },
    { domain: 'bing.com', match: 'registered_domain', type: 'search', platform: '', note: '', updatedAt: 'Jun 10' },
    { domain: 'duckduckgo.com', match: 'registered_domain', type: 'search', platform: '', note: '', updatedAt: 'Jun 10' },
    // ai (split out from search — see PRD §6 AI channel)
    { domain: 'chatgpt.com', match: 'exact_host', type: 'ai', platform: '', note: 'ChatGPT', updatedAt: 'Jun 13' },
    { domain: 'gemini.google.com', match: 'exact_host', type: 'ai', platform: '', note: 'Gemini (host-level; google.* stays search)', updatedAt: 'Jun 13' },
    { domain: 'perplexity.ai', match: 'registered_domain', type: 'ai', platform: '', note: 'Perplexity', updatedAt: 'Jun 13' },
    // email
    { domain: 'mail.google.com', match: 'exact_host', type: 'email', platform: '', note: 'Webmail', updatedAt: 'Jun 10' },
    { domain: 'gmx.net', match: 'registered_domain', type: 'email', platform: '', note: 'DE market', updatedAt: 'Jun 10' },
  ];

  const channelRules = [
    { medium: 'cpc, ppc, paid, paidsocial', channel: 'Paid' },
    { medium: 'email, newsletter', channel: 'Email' },
    { medium: 'social', channel: 'Social' },
    { medium: '(referrer in search dict)', channel: 'Search' },
    { medium: '(referrer in ai dict)', channel: 'AI' },
    { medium: '(other external referrer)', channel: 'Referral' },
    { medium: '(no referrer, no utm)', channel: 'Direct' },
  ];
  const clickIds = ['gclid', 'fbclid', 'ttclid', 'msclkid'];
  const channelPriority = ['Paid', 'Email', 'Social', 'Search', 'AI', 'Referral', 'Direct'];

  const model = { current: 'last_non_direct', clickWindow: 30, viewWindow: 1 };
  const session = { timeout: 30, maxLength: 24 };

  // Version history — published rule sets, effective-dated (data warehouse reads latest)
  const versions = [
    { v: 12, date: 'Jun 13, 2026', by: 'ops.amy', kind: 'correction', summary: 'Added chatgpt.com (search), facebook.com platform fix', recompute: 'Hot window auto-recomputed' },
    { v: 11, date: 'Jun 12, 2026', by: 'ryan', kind: 'correction', summary: 'Added PayPal / Stripe / Google OAuth exclude domains', recompute: 'Hot window auto-recomputed' },
    { v: 10, date: 'Jun 9, 2026', by: 'ryan', kind: 'definition', summary: 'Attribution model set to Last non-direct, click window 30d', recompute: 'Applied to new data only (effective Jun 9)' },
  ];

  return { menuSchema, menuTree, settingsMenuTree, rolePermissionTree, expectedStoreAdminSidebar, accounts, categories,
    attribution: { domains, channelRules, clickIds, channelPriority, model, session, versions } };
})();
