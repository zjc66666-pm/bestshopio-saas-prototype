/* BestShopio Platform Center - mock data.
   V1.145 Menu models the store-admin sidebar source of truth:
   - menu_level/type still controls the tree depth.
   - navGroup controls where the item appears: Main / Channel / App.
   - Settings is a regular root menu record. Store Admin recognizes the
     /admin/settings root route and pins it at the lower left; no separate source exists.
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
      { id: 31, title: 'Collections', route: '/admin/products/collections', sort: 80, type: 'submenu', permissions: [
        { id: 301, menu_id: 31, title: 'Collection list', route: 'products:collections:list' },
        { id: 302, menu_id: 31, title: 'Add collection', route: 'products:collections:add' } ] },
      { id: 32, title: 'Reviews', route: '/admin/products/reviews', sort: 70, type: 'submenu', permissions: [
        { id: 303, menu_id: 32, title: 'Review list', route: 'products:reviews:list' } ] } ] },
    { id: 4, title: 'Customers', route: '/admin/customers', sort: 80, type: 'menu', navGroup: 'main' },
    { id: 5, title: 'Discounts', route: '/admin/discount', sort: 70, type: 'menu', navGroup: 'main' },
    { id: 8, title: 'Content', route: '/admin/content/blog', sort: 60, type: 'menu', navGroup: 'main', children: [
      { id: 81, title: 'Blog', route: '/admin/content/blog', sort: 60, type: 'submenu' },
      { id: 82, title: 'Page', route: '/admin/content/page', sort: 50, type: 'submenu' },
      { id: 83, title: 'Menu', route: '/admin/content/menu', sort: 40, type: 'submenu' } ] },
    { id: 9, title: 'Online store', route: '/admin/channels/online-store', sort: 50, type: 'menu', navGroup: 'channel' },
    { id: 10, title: 'Meta', route: '/admin/channels/meta', sort: 45, type: 'menu', navGroup: 'channel', permissions: [
      { id: 1001, menu_id: 10, title: 'Edit Meta tracking', route: 'channels:meta:tracking:update' } ] },
    { id: 11, title: 'Google', route: '/admin/channels/google/products', sort: 40, type: 'menu', navGroup: 'channel', permissions: [
      { id: 1101, menu_id: 11, title: 'Edit Google tracking', route: 'channels:google:tracking:update' },
      { id: 1102, menu_id: 11, title: 'Product sync settings', route: 'channels:google:products:update' } ] },
    { id: 12, title: 'BestCheckout', route: '/admin/apps/bestcheckout', sort: 30, type: 'menu', navGroup: 'app' },
    { id: 13, title: 'Settings', route: '/admin/settings', sort: 30, type: 'menu', navGroup: 'main', children: [
      { id: 131, title: 'Basic settings', route: '/admin/settings/basic_settings', sort: 70, type: 'submenu', permissions: [
        { id: 13101, menu_id: 131, title: 'View basic settings', route: 'settings:base:view' },
        { id: 13102, menu_id: 131, title: 'Edit basic settings', route: 'settings:base:update' } ] },
      { id: 132, title: 'Payments', route: '/admin/settings/payments', sort: 60, type: 'submenu', permissions: [
        { id: 13201, menu_id: 132, title: 'View payments', route: 'settings:payments:view' },
        { id: 13202, menu_id: 132, title: 'Edit payments', route: 'settings:payments:update' } ] },
      { id: 133, title: 'Currency', route: '/admin/settings/currency', sort: 50, type: 'submenu' },
      { id: 134, title: 'Checkout', route: '/admin/settings/checkout', sort: 40, type: 'submenu' },
      { id: 135, title: 'Metafields', route: '/admin/settings/metafields', sort: 30, type: 'submenu' },
      { id: 136, title: 'Ship locations', route: '/admin/settings/ship_locations', sort: 20, type: 'submenu' },
      { id: 137, title: 'Shipping rates', route: '/admin/settings/shipping_rates', sort: 10, type: 'submenu' },
      { id: 138, title: 'Role', route: '/admin/settings/staff-permissions/roles', sort: 9, type: 'submenu', permissions: [
        { id: 13801, menu_id: 138, title: 'View roles', route: 'settings:roles:view' },
        { id: 13802, menu_id: 138, title: 'Add role', route: 'settings:roles:add' },
        { id: 13803, menu_id: 138, title: 'Edit role', route: 'settings:roles:update' },
        { id: 13804, menu_id: 138, title: 'Delete role', route: 'settings:roles:delete' } ] },
      { id: 139, title: 'Staff', route: '/admin/settings/staff-permissions/staff', sort: 8, type: 'submenu', permissions: [
        { id: 13901, menu_id: 139, title: 'View staff', route: 'settings:staff:view' },
        { id: 13902, menu_id: 139, title: 'Invite staff', route: 'settings:staff:invite' },
        { id: 13903, menu_id: 139, title: 'Edit staff', route: 'settings:staff:update' },
        { id: 13904, menu_id: 139, title: 'Delete staff', route: 'settings:staff:delete' } ] } ] },
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
    settings: { key: 'settings', title: 'Settings', route: '/admin/settings', children: [
      { key: 'settings_base', title: 'Basic settings', route: '/admin/settings/basic_settings' },
      { key: 'settings_payments', title: 'Payments', route: '/admin/settings/payments' },
      { key: 'settings_currency', title: 'Currency', route: '/admin/settings/currency' },
      { key: 'settings_checkout', title: 'Checkout', route: '/admin/settings/checkout' },
      { key: 'settings_metafields', title: 'Metafields', route: '/admin/settings/metafields' },
      { key: 'settings_ship_locations', title: 'Ship locations', route: '/admin/settings/ship_locations' },
      { key: 'settings_shipping_rates', title: 'Shipping rates', route: '/admin/settings/shipping_rates' },
      { key: 'settings_role', title: 'Role', route: '/admin/settings/staff-permissions/roles' },
      { key: 'settings_staff', title: 'Staff', route: '/admin/settings/staff-permissions/staff' },
    ] },
  };

  // Store Roles read the same single tree as the Store Admin sidebar.
  const rolePermissionTree = [
    { context: 'menu', title: 'Menu', children: menuTree },
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

  // ---- Platform category tree (aligned with the live SaaS category model) ----
  // A platform category can be mapped independently to Shopify, Google and Axon
  // taxonomies. `platformId` remains only as a legacy fixture for the older mock.
  const categories = [
    { id: 1, name: 'Apparel', platformId: 'cat_apparel', sort: 100, level: 1, shopifyCategoryId: 'aa-1', shopifyCategoryBreadcrumb: 'Apparel & Accessories > Clothing', googleCategoryId: '1604', googleCategoryBreadcrumb: 'Apparel & Accessories > Clothing', axonCategoryId: 'axon-apparel', axonCategoryBreadcrumb: 'Fashion > Apparel', children: [
      { id: 11, name: 'Leggings', platformId: 'cat_leggings', sort: 100, level: 2, shopifyCategoryId: 'aa-1-3', shopifyCategoryBreadcrumb: 'Apparel & Accessories > Clothing > Pants', googleCategoryId: '204', googleCategoryBreadcrumb: 'Apparel & Accessories > Clothing > Pants', axonCategoryId: 'axon-leggings', axonCategoryBreadcrumb: 'Fashion > Apparel > Leggings' },
      { id: 12, name: 'Tops', platformId: 'cat_tops', sort: 90, level: 2, shopifyCategoryId: 'aa-1-2', shopifyCategoryBreadcrumb: 'Apparel & Accessories > Clothing > Shirts & Tops', googleCategoryId: '212', googleCategoryBreadcrumb: 'Apparel & Accessories > Clothing > Shirts & Tops', axonCategoryId: 'axon-tops', axonCategoryBreadcrumb: 'Fashion > Apparel > Tops' },
      { id: 13, name: 'Outerwear', platformId: 'cat_outerwear', sort: 80, level: 2, shopifyCategoryId: 'aa-1-5', shopifyCategoryBreadcrumb: 'Apparel & Accessories > Clothing > Outerwear', googleCategoryId: '5598', googleCategoryBreadcrumb: 'Apparel & Accessories > Clothing > Outerwear', axonCategoryId: 'axon-outerwear', axonCategoryBreadcrumb: 'Fashion > Apparel > Outerwear' } ] },
    { id: 2, name: 'Beauty', platformId: 'cat_beauty', sort: 90, level: 1, shopifyCategoryId: 'hb-1', shopifyCategoryBreadcrumb: 'Health & Beauty > Personal Care', googleCategoryId: '469', googleCategoryBreadcrumb: 'Health & Beauty > Personal Care', axonCategoryId: 'axon-beauty', axonCategoryBreadcrumb: 'Beauty & Personal Care', children: [
      { id: 21, name: 'Skincare', platformId: 'cat_skincare', sort: 100, level: 2, shopifyCategoryId: 'hb-1-1', shopifyCategoryBreadcrumb: 'Health & Beauty > Personal Care > Skin Care', googleCategoryId: '567', googleCategoryBreadcrumb: 'Health & Beauty > Personal Care > Skin Care', axonCategoryId: 'axon-skincare', axonCategoryBreadcrumb: 'Beauty & Personal Care > Skin Care' },
      { id: 22, name: 'Makeup', platformId: 'cat_makeup', sort: 90, level: 2, shopifyCategoryId: 'hb-1-2', shopifyCategoryBreadcrumb: 'Health & Beauty > Personal Care > Cosmetics', googleCategoryId: '1434', googleCategoryBreadcrumb: 'Health & Beauty > Personal Care > Cosmetics', axonCategoryId: 'axon-makeup', axonCategoryBreadcrumb: 'Beauty & Personal Care > Makeup' } ] },
    { id: 3, name: 'Home & Living', platformId: 'cat_home', sort: 80, level: 1, shopifyCategoryId: 'ha-1', shopifyCategoryBreadcrumb: 'Home & Garden', googleCategoryId: '536', googleCategoryBreadcrumb: 'Home & Garden', axonCategoryId: 'axon-home', axonCategoryBreadcrumb: 'Home & Living', children: [
      { id: 31, name: 'Kitchen', platformId: 'cat_kitchen', sort: 100, level: 2, shopifyCategoryId: 'ha-1-4', shopifyCategoryBreadcrumb: 'Home & Garden > Kitchen & Dining', googleCategoryId: '638', googleCategoryBreadcrumb: 'Home & Garden > Kitchen & Dining', axonCategoryId: 'axon-kitchen', axonCategoryBreadcrumb: 'Home & Living > Kitchen' },
      { id: 32, name: 'Decor', platformId: 'cat_decor', sort: 90, level: 2, shopifyCategoryId: 'ha-1-6', shopifyCategoryBreadcrumb: 'Home & Garden > Decor', googleCategoryId: '696', googleCategoryBreadcrumb: 'Home & Garden > Decor', axonCategoryId: 'axon-decor', axonCategoryBreadcrumb: 'Home & Living > Decor' } ] },
    { id: 4, name: 'Electronics', platformId: 'cat_electronics', sort: 70, level: 1, shopifyCategoryId: 'el-1', shopifyCategoryBreadcrumb: 'Electronics', googleCategoryId: '222', googleCategoryBreadcrumb: 'Electronics', axonCategoryId: 'axon-electronics', axonCategoryBreadcrumb: 'Electronics' },
    { id: 5, name: 'Accessories', platformId: 'cat_accessories', sort: 60, level: 1, shopifyCategoryId: 'aa-2', shopifyCategoryBreadcrumb: 'Apparel & Accessories > Jewelry & Accessories', googleCategoryId: '188', googleCategoryBreadcrumb: 'Apparel & Accessories > Jewelry & Accessories', axonCategoryId: 'axon-accessories', axonCategoryBreadcrumb: 'Fashion > Accessories' },
  ];

  // ---- Attribution rules (V1.140) — consumed by the data warehouse ----
  // Domain dictionary = dim_referrer_domain. `channel` is the named source shown
  // in reports; `type` is the broader channel category. Exclude entries ignore a
  // technical referrer instead of creating a false Others result.
  // match: exact_host | registered_domain | prefix_wildcard
  const domains = [
    // exclude — shared payment gateway + OAuth return. Current store domains
    // are detected per shop by Domain Service and never belong in this global dictionary.
    { domain: 'paypal.com', match: 'registered_domain', channel: '', type: 'exclude', note: 'Payment redirect', updatedAt: 'Jun 12' },
    { domain: 'checkout.stripe.com', match: 'exact_host', channel: '', type: 'exclude', note: 'Hosted checkout', updatedAt: 'Jun 12' },
    { domain: 'accounts.google.com', match: 'exact_host', channel: '', type: 'exclude', note: 'OAuth return', updatedAt: 'Jun 12' },
    // social
    { domain: 'facebook.com', match: 'registered_domain', channel: 'Facebook', type: 'social', note: 'Covers m./l./lm. subdomains', updatedAt: 'Jun 13' },
    { domain: 'instagram.com', match: 'registered_domain', channel: 'Instagram', type: 'social', note: '', updatedAt: 'Jun 13' },
    { domain: 't.co', match: 'registered_domain', channel: 'X', type: 'social', note: 'X short-link', updatedAt: 'Jun 13' },
    { domain: 'tiktok.com', match: 'registered_domain', channel: 'TikTok', type: 'social', note: '', updatedAt: 'Jun 11' },
    { domain: 'youtube.com', match: 'registered_domain', channel: 'YouTube', type: 'social', note: '', updatedAt: 'Jun 11' },
    { domain: 'pinterest.*', match: 'prefix_wildcard', channel: 'Pinterest', type: 'social', note: 'Country TLDs', updatedAt: 'Jun 11' },
    // search
    { domain: 'google.*', match: 'prefix_wildcard', channel: 'Google', type: 'search', note: 'All country TLDs', updatedAt: 'Jun 10' },
    { domain: 'bing.com', match: 'registered_domain', channel: 'Bing', type: 'search', note: '', updatedAt: 'Jun 10' },
    { domain: 'duckduckgo.com', match: 'registered_domain', channel: 'DuckDuckGo', type: 'search', note: '', updatedAt: 'Jun 10' },
    // ai (split out from search — see PRD §6 AI channel)
    { domain: 'chatgpt.com', match: 'exact_host', channel: 'ChatGPT', type: 'ai', note: '', updatedAt: 'Jun 13' },
    { domain: 'gemini.google.com', match: 'exact_host', channel: 'Gemini', type: 'ai', note: 'Host-level; google.* stays search', updatedAt: 'Jun 13' },
    { domain: 'perplexity.ai', match: 'registered_domain', channel: 'Perplexity', type: 'ai', note: '', updatedAt: 'Jun 13' },
    // email
    { domain: 'mail.google.com', match: 'exact_host', channel: 'Gmail', type: 'email', note: 'Webmail', updatedAt: 'Jun 10' },
    { domain: 'gmx.net', match: 'registered_domain', channel: 'GMX', type: 'email', note: 'DE market', updatedAt: 'Jun 10' },
  ];

  // UTM values are stored as raw visit metadata for merchant-side UTM reports.
  // They do not override the source channel identified from the referrer domain.
  const utmFields = ['utm_id', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  // Deterministic precedence when more than one dictionary entry can match.
  const domainMatchPriority = ['exact_host', 'registered_domain', 'prefix_wildcard'];

  // ---- BestCheckout operations: platform-owned connection, sync and reconciliation control plane ----
  const bestcheckoutOps = {
    stores: [
      { id: 'shop_lavender', store: 'Lavender Labs', domain: 'lavender-labs.myshopify.com', shopId: '63352940', install: 'Connected', data: 'Healthy', lastSuccess: '2 min ago', lastAttempt: '2 min ago', funnels: '3 live', payment: '2 routes', writeback: 'Healthy', health: 'Healthy', next: 'No action required', bestshopio: {
        storeName: 'Lavender Labs', merchant: 'Avery Wells', merchantId: 'mer_1042', provisionStatus: 'Completed', storeStatus: 'Active', defaultDomain: 'lavender-labs.stores.bestshopio.com', customDomain: 'lavenderlabs.com', ssl: 'Active', region: 'US', routingVersion: 'v1', createdAt: 'Jun 18, 2026', taskUpdated: 'Jun 18, 2026 09:42'
      }, readiness: {
        authorization: { status: 'Connected', value: 'OAuth + Admin API', scopes: 'Products · orders · customers', checked: '2 min ago' },
        sync: { status: 'Healthy', value: '5 data entities · 5 webhook topics', detail: '5 / 5 delivery checks healthy', checked: '2 min ago' },
        domain: { status: 'Verified', value: 'checkout.lavenderlabs.com', host: 'checkout', target: 'edge.bestcheckout.app', ssl: 'Active', checked: '2 min ago' },
        paymentConfig: { status: 'Configured', value: 'Stripe · live mode', methods: 'Cards · Apple Pay · Google Pay', detail: '3 / 3 payment webhooks healthy', checked: '1 min ago' },
        embed: { status: 'Enabled', value: 'Dawn', detail: 'Cart checkout · Buy it now · Cart drawer', checked: '1 min ago' }
      } },
      { id: 'shop_folast', store: 'Folast Studio', domain: 'folast-studio.myshopify.com', shopId: '71830452', install: 'Connected', data: 'Needs attention', lastSuccess: '18 min ago', lastAttempt: '11 min ago · webhook retry pending', funnels: '2 live', payment: '1 route', writeback: 'Healthy', health: 'Needs attention', next: 'Resolve 2 variant mappings', bestshopio: {
        storeName: 'Folast Studio', merchant: 'Mia Chen', merchantId: 'mer_1096', provisionStatus: 'Completed', storeStatus: 'Active', defaultDomain: 'folast-studio.stores.bestshopio.com', customDomain: 'folaststudio.com', ssl: 'Active', region: 'US', routingVersion: 'v1', createdAt: 'Jul 02, 2026', taskUpdated: 'Jul 02, 2026 14:18'
      }, readiness: {
        authorization: { status: 'Connected', value: 'OAuth + Admin API', scopes: 'Products · orders · customers', checked: '11 min ago' },
        sync: { status: 'Needs attention', value: '5 data entities · 5 webhook topics', detail: 'Webhook retry is pending', checked: '11 min ago' },
        domain: { status: 'Verified', value: 'checkout.folast-studio.com', host: 'checkout', target: 'edge.bestcheckout.app', ssl: 'Active', checked: '18 min ago' },
        paymentConfig: { status: 'Configured', value: 'Airwallex · live mode', methods: 'Cards · Apple Pay', detail: '1 / 1 payment webhooks healthy', checked: '8 min ago' },
        embed: { status: 'Not detected', value: 'Shrine PRO', detail: 'Theme changed; App Embed is not on the live theme', checked: '17 min ago' }
      } },
      { id: 'shop_heyjune', store: 'Hey June', domain: 'hey-june.myshopify.com', shopId: '80219673', install: 'Connected', data: 'Healthy', lastSuccess: '5 min ago', lastAttempt: '5 min ago', funnels: '1 live', payment: '1 route', writeback: 'Needs attention', health: 'Needs attention', next: 'Replay 1 order writeback', bestshopio: {
        storeName: 'Hey June', merchant: 'June Park', merchantId: 'mer_1120', provisionStatus: 'Completed', storeStatus: 'Active', defaultDomain: 'hey-june.stores.bestshopio.com', customDomain: 'Not connected', ssl: 'Not configured', region: 'US', routingVersion: 'v1', createdAt: 'Jul 08, 2026', taskUpdated: 'Jul 08, 2026 11:06'
      }, readiness: {
        authorization: { status: 'Connected', value: 'OAuth + Admin API', scopes: 'Products · orders · customers', checked: '5 min ago' },
        sync: { status: 'Healthy', value: '5 data entities · 5 webhook topics', detail: '5 / 5 delivery checks healthy', checked: '5 min ago' },
        domain: { status: 'Verified', value: 'checkout.heyjune.co', host: 'checkout', target: 'edge.bestcheckout.app', ssl: 'Active', checked: '5 min ago' },
        paymentConfig: { status: 'Configured', value: 'Stripe · live mode', methods: 'Cards · Link', detail: '2 / 2 payment webhooks healthy', checked: '4 min ago' },
        embed: { status: 'Enabled', value: 'Sense', detail: 'Cart checkout · Buy it now · Cart drawer', checked: '5 min ago' }
      } },
      { id: 'shop_river', store: 'River Remedy', domain: 'river-remedy.myshopify.com', shopId: '39104728', install: 'Reauthorization needed', data: 'Paused', lastSuccess: 'Yesterday', lastAttempt: '35 min ago · blocked by authorization', funnels: '0 live', payment: '0 routes', writeback: 'Paused', health: 'Action required', next: 'Ask merchant to reconnect Shopify', bestshopio: {
        storeName: 'River Remedy', merchant: 'Riley Morgan', merchantId: 'mer_1178', provisionStatus: 'Failed', storeStatus: 'Disabled', defaultDomain: 'river-remedy.stores.bestshopio.com', customDomain: 'riverremedy.com', ssl: 'Pending', region: 'US', routingVersion: 'v1', createdAt: 'Jul 15, 2026', taskUpdated: 'Today 08:55'
      }, readiness: {
        authorization: { status: 'Reauthorization needed', value: 'OAuth + Admin API', scopes: 'Access token revoked', checked: '35 min ago' },
        sync: { status: 'Paused', value: 'No new data pulls or webhooks', detail: 'Blocked by authorization', checked: '35 min ago' },
        domain: { status: 'Not verified', value: 'checkout.riverremedy.com', host: 'checkout', target: 'edge.bestcheckout.app', ssl: 'Pending', checked: 'Yesterday' },
        paymentConfig: { status: 'Not connected', value: 'No processor connected', methods: 'No payment methods available', detail: 'Credentials are not stored', checked: 'Yesterday' },
        embed: { status: 'Disabled', value: 'No live theme detected', detail: 'Reconnect Shopify before restoring App Embed', checked: 'Yesterday' }
      } },
    ],
    syncIssues: [
      { id: 'sync_02', storeId: 'shop_folast', kind: 'Variant mapping', subject: 'Variant 4812 / Sage linen dress', detail: 'The Shopify variant was replaced after the initial import. Existing offer rules cannot resolve it.', firstSeen: '18 min ago', retries: 3, state: 'Action required', action: 'Map replacement' },
      { id: 'sync_03', storeId: 'shop_folast', kind: 'Webhook delivery', subject: 'products/update · wh_9012', detail: 'The retry budget was exhausted after repeated 429 responses. The event payload is preserved for replay.', firstSeen: '11 min ago', retries: 5, state: 'Retryable', action: 'Replay event' },
      { id: 'sync_04', storeId: 'shop_river', kind: 'Authorization', subject: 'Shopify access token', detail: 'The merchant revoked the App authorization. New checkout traffic remains on Shopify native control.', firstSeen: 'Yesterday', retries: 0, state: 'Merchant action', action: 'Request reconnection' },
    ],
    writebacks: [
      { id: 'wb_441', storeId: 'shop_heyjune', order: 'BC-10482', shopifyOrder: '#7821', state: 'Retryable', age: '7 min', detail: 'Shopify accepted the idempotency key but the projection acknowledgement timed out.' },
      { id: 'wb_442', storeId: 'shop_lavender', order: 'BC-10479', shopifyOrder: '#7718', state: 'Completed', age: '2 min', detail: 'Final Order Snapshot projected successfully.' },
      { id: 'wb_443', storeId: 'shop_folast', order: 'BC-10475', shopifyOrder: '#3184', state: 'Completed', age: '18 min', detail: 'Offer acceptance and order update reconciled.' },
    ],
    runtime: [
      { storeId: 'shop_lavender', surface: 'Hosted Checkout', policy: 'Shopify native control 15%', funnel: 'Sleep Reset', status: 'Healthy' },
      { storeId: 'shop_folast', surface: 'Hosted Checkout', policy: 'Shopify native control 20%', funnel: 'Seasonal bundle', status: 'Review' },
      { storeId: 'shop_heyjune', surface: 'Hosted Checkout', policy: 'Shopify native control 10%', funnel: 'Refill recovery', status: 'Healthy' },
      { storeId: 'shop_river', surface: 'Shopify native only', policy: 'Fallback before payment', funnel: 'No live Funnel', status: 'Paused' },
    ],
  };

  // ---- Platform control plane: store lifecycle, platform content and governance ----
  // These records are intentionally platform-facing. Merchant-facing product, catalog,
  // order and customer operations remain in the Merchant / BestCheckout surfaces.
  const platformCenter = {
    stores: [
      { id: 'shop_lavender', shopId: '63352940', name: 'Lavender Labs', organizationId: 'org_lavender', organization: 'Lavender Labs Inc.', owner: 'Avery Wells', type: 'bestcheckout', lifecycle: 'Active', plan: 'Growth', region: 'US', createdAt: 'Jun 18, 2026', provisioning: 'Completed', connection: 'Healthy', domainHealth: 'Healthy', domainSetup: 'Verified', paymentSetup: 'Configured', product: 'BestCheckout', nextAction: 'No action required', shopify: 'lavender-labs.myshopify.com', installStatus: 'connected', payments: { configured: ['Stripe', 'Airwallex', 'PayPal'], active: ['Stripe', 'PayPal'] }, onboarding: { createdAt: 'Jun 18, 2026 09:20', linkSentAt: 'Jun 18, 2026 16:20', installedAt: 'Jun 19, 2026 11:05', paymentBoundAt: 'Jun 22, 2026 09:40', domainBoundAt: 'Jun 23, 2026 08:10', firstOrderAt: 'Jun 29, 2026 14:15' } },
      { id: 'shop_folast', shopId: '71830452', name: 'Folast Studio', organizationId: 'org_folast', organization: 'Folast Studio LLC', owner: 'Mia Chen', type: 'bestcheckout', lifecycle: 'Active', plan: 'Growth', region: 'US', createdAt: 'Jul 02, 2026', provisioning: 'Completed', connection: 'Needs attention', domainHealth: 'Healthy', domainSetup: 'Verified', paymentSetup: 'Configured', product: 'BestCheckout', nextAction: 'Resolve variant mapping', shopify: 'folast-studio.myshopify.com', installStatus: 'connected', payments: { configured: ['Airwallex'], active: ['Airwallex'] }, onboarding: { createdAt: 'Jul 02, 2026 10:15', linkSentAt: 'Jul 02, 2026 14:15', installedAt: 'Jul 04, 2026 09:30', domainBoundAt: 'Jul 06, 2026 10:20', paymentBoundAt: 'Jul 08, 2026 11:00', firstOrderAt: 'Jul 13, 2026 16:40' } },
      { id: 'shop_heyjune', shopId: '80219673', name: 'Hey June', organizationId: 'org_heyjune', organization: 'Hey June Co.', owner: 'June Park', type: 'bestcheckout', lifecycle: 'Active', plan: 'Starter', region: 'US', createdAt: 'Jul 08, 2026', provisioning: 'Completed', connection: 'Healthy', domainHealth: 'Healthy', domainSetup: 'Verified', paymentSetup: 'Configured', product: 'BestCheckout', nextAction: 'Replay order writeback', shopify: 'hey-june.myshopify.com', installStatus: 'connected', payments: { configured: ['Stripe', 'PayPal'], active: ['Stripe'] }, onboarding: { createdAt: 'Jul 08, 2026 09:40', linkSentAt: 'Jul 08, 2026 12:40', installedAt: 'Jul 10, 2026 10:00', paymentBoundAt: 'Jul 13, 2026 08:00', firstOrderAt: 'Jul 20, 2026 11:05' } },
      { id: 'shop_coral', shopId: '56482109', name: 'Coral Goods', organizationId: 'org_coral', organization: 'Coral Goods Ltd.', owner: 'Lena Ortiz', type: 'bestcheckout', lifecycle: 'Active', plan: 'Starter', region: 'US', createdAt: 'Sep 5, 2026', provisioning: 'Completed', connection: 'Healthy', domainHealth: 'Pending', domainSetup: 'Pending', paymentSetup: 'Not connected', product: 'BestCheckout', nextAction: 'Finish domain verification', shopify: 'coral-goods.myshopify.com', installStatus: 'connected', onboarding: { createdAt: 'Sep 5, 2026 10:20', linkSentAt: 'Sep 5, 2026 14:20', installedAt: 'Sep 6, 2026 09:50' } },
      { id: 'shop_river', shopId: '39104728', name: 'River Remedy', organizationId: 'org_river', organization: 'River Remedy Ltd.', owner: 'Riley Morgan', type: 'bestcheckout', lifecycle: 'Suspended', plan: 'Starter', region: 'US', createdAt: 'Jul 15, 2026', provisioning: 'Failed', connection: 'Action required', domainHealth: 'Review', domainSetup: 'Not verified', paymentSetup: 'Not connected', product: 'BestCheckout', nextAction: 'Request Shopify reconnection', shopify: 'river-remedy.myshopify.com', installStatus: 'reauth', onboarding: { createdAt: 'Jul 15, 2026 09:10', linkSentAt: 'Jul 15, 2026 17:10', installedAt: 'Jul 17, 2026 10:40' } },
      { id: 'shop_northstar', shopId: '91028465', name: 'Northstar', organizationId: 'org_northstar', organization: 'Northstar Inc.', owner: 'Sam Reed', type: 'bestcheckout', lifecycle: 'Provisioning', plan: 'Starter', region: 'US', createdAt: 'Sep 6, 2026', provisioning: 'In progress', connection: 'Not connected', domainHealth: 'Pending', domainSetup: 'Pending', paymentSetup: 'Not connected', product: 'BestCheckout', nextAction: 'Finish Custom App and send install link', shopify: 'northstar.myshopify.com', installStatus: 'preparing', onboarding: {} },
      { id: 'shop_atelier', shopId: '24785601', name: 'Atelier', organizationId: 'org_atelier', organization: 'Atelier Studio', owner: 'Iris Cole', type: 'bestcheckout', lifecycle: 'Provisioning', plan: 'Starter', region: 'US', createdAt: 'Sep 1, 2026', provisioning: 'In progress', connection: 'Not connected', domainHealth: 'Pending', domainSetup: 'Pending', paymentSetup: 'Not connected', product: 'BestCheckout', nextAction: 'Waiting for merchant to install', shopify: 'atelier.myshopify.com', installStatus: 'ready', onboarding: { createdAt: 'Sep 1, 2026 11:30', linkSentAt: 'Sep 2, 2026 09:15' } },
      { id: 'shop_harbor', shopId: '85631094', name: 'Harbor', organizationId: 'org_harbor', organization: 'Harbor Goods Ltd.', owner: 'Noah Hale', type: 'bestcheckout', lifecycle: 'Provisioning', plan: 'Starter', region: 'US', createdAt: 'Aug 24, 2026', provisioning: 'In progress', connection: 'Not connected', domainHealth: 'Pending', domainSetup: 'Pending', paymentSetup: 'Not connected', product: 'BestCheckout', nextAction: 'Resend install link', shopify: 'harbor.myshopify.com', installStatus: 'expired', onboarding: { createdAt: 'Aug 24, 2026 13:10', linkSentAt: 'Aug 24, 2026 18:40' } },
      { id: 'store_silixwear', shopId: '12049876', name: 'Silixwear', organizationId: 'org_silix', organization: 'Silixwear Commerce Inc.', owner: 'Ryan Cole', type: 'bestshopio', lifecycle: 'Active', plan: 'Commerce Pro', region: 'US', createdAt: 'May 16, 2026', provisioning: 'Completed', connection: 'Healthy', domainHealth: 'Healthy', domainSetup: 'Verified', paymentSetup: 'Configured', product: 'BestShopio', nextAction: 'No action required', shopify: '--', defaultDomain: 'silixwear.stores.bestshopio.com', primaryDomain: 'silixwear.com', payments: { configured: ['Airwallex', 'Stripe'], active: ['Airwallex'] }, onboarding: { createdAt: 'May 16, 2026 08:50', paymentBoundAt: 'May 16, 2026 17:20', domainBoundAt: 'May 20, 2026 10:00', firstOrderAt: 'May 28, 2026 13:30' } },
      { id: 'store_willow', shopId: '73051842', name: 'Willow Atelier', organizationId: 'org_willow', organization: 'Willow Atelier Ltd.', owner: 'Claire Dunn', type: 'bestshopio', lifecycle: 'Active', plan: 'Commerce Pro', region: 'UK', createdAt: 'Aug 1, 2026', provisioning: 'Completed', connection: 'Healthy', domainHealth: 'Healthy', domainSetup: 'Verified', paymentSetup: 'Configured', product: 'BestShopio', nextAction: 'Waiting for first order', shopify: '--', defaultDomain: 'willow-atelier.stores.bestshopio.com', primaryDomain: 'willowatelier.com', payments: { configured: ['Stripe'], active: ['Stripe'] }, onboarding: { createdAt: 'Aug 1, 2026 09:10', paymentBoundAt: 'Aug 3, 2026 11:20', domainBoundAt: 'Aug 5, 2026 16:40' } },
      { id: 'store_mira', shopId: '49281736', name: 'Mira Botanics', organizationId: 'org_mira', organization: 'Mira Botanics Inc.', owner: 'Priya Shah', type: 'bestshopio', lifecycle: 'Active', plan: 'Commerce Pro', region: 'US', createdAt: 'Aug 12, 2026', provisioning: 'Completed', connection: 'Healthy', domainHealth: 'Healthy', domainSetup: 'Verified', paymentSetup: 'Not connected', product: 'BestShopio', nextAction: 'Connect a payment provider', shopify: '--', defaultDomain: 'mira-botanics.stores.bestshopio.com', primaryDomain: 'mira-botanics.com', payments: { configured: [], active: [] }, onboarding: { createdAt: 'Aug 12, 2026 10:15', domainBoundAt: 'Aug 18, 2026 14:05' } },
      { id: 'store_oak', shopId: '58392014', name: 'Oak & Ember', organizationId: 'org_oak', organization: 'Oak & Ember Co.', owner: 'Ben Ortiz', type: 'bestshopio', lifecycle: 'Active', plan: 'Commerce Pro', region: 'US', createdAt: 'Aug 20, 2026', provisioning: 'Completed', connection: 'Healthy', domainHealth: 'Pending', domainSetup: 'Pending', paymentSetup: 'Configured', product: 'BestShopio', nextAction: 'Connect a storefront domain', shopify: '--', defaultDomain: 'oak-ember.stores.bestshopio.com', payments: { configured: ['PayPal'], active: ['PayPal'] }, onboarding: { createdAt: 'Aug 20, 2026 11:40', paymentBoundAt: 'Aug 22, 2026 09:55' } },
      { id: 'store_lumen', shopId: '61940328', name: 'Lumen Paper', organizationId: 'org_lumen', organization: 'Lumen Paper LLC', owner: 'Hannah Cho', type: 'bestshopio', lifecycle: 'Active', plan: 'Commerce Pro', region: 'US', createdAt: 'Jul 10, 2026', provisioning: 'Completed', connection: 'Healthy', domainHealth: 'Pending', domainSetup: 'Pending', paymentSetup: 'Configured', product: 'BestShopio', nextAction: 'Optional custom domain', shopify: '--', defaultDomain: 'lumen-paper.stores.bestshopio.com', payments: { configured: ['Stripe', 'PayPal'], active: ['Stripe'] }, onboarding: { createdAt: 'Jul 10, 2026 08:30', paymentBoundAt: 'Jul 12, 2026 13:15', firstOrderAt: 'Jul 21, 2026 10:40' } },
      { id: 'store_northpine', shopId: '67421583', name: 'Northpine Home', organizationId: 'org_northpine', organization: 'Northpine Home GmbH', owner: 'Elena Fischer', type: 'bestshopio', lifecycle: 'Active', plan: 'Commerce Pro', region: 'DE', createdAt: 'Jul 28, 2026', provisioning: 'Completed', connection: 'Healthy', domainHealth: 'Pending', domainSetup: 'Pending', paymentSetup: 'Configured', product: 'BestShopio', nextAction: 'Finish domain verification', shopify: '--', defaultDomain: 'northpine-home.stores.bestshopio.com', payments: { configured: ['Stripe'], active: ['Stripe'] }, onboarding: { createdAt: 'Jul 28, 2026 10:05', paymentBoundAt: 'Aug 2, 2026 11:45' } },
      { id: 'store_cedar', shopId: '38120457', name: 'Cedar & Co', organizationId: 'org_cedar', organization: 'Cedar & Co Pty', owner: 'Tom Blake', type: 'bestshopio', lifecycle: 'Active', plan: 'Commerce Pro', region: 'AU', createdAt: 'Sep 7, 2026', provisioning: 'Completed', connection: 'Healthy', domainHealth: 'Pending', domainSetup: 'Pending', paymentSetup: 'Not connected', product: 'BestShopio', nextAction: 'Connect payment and domain', shopify: '--', defaultDomain: 'cedar-co.stores.bestshopio.com', payments: { configured: [], active: [] }, onboarding: { createdAt: 'Sep 7, 2026 09:20' } },
      { id: 'store_nori', shopId: '84162953', name: 'Nori Market', organizationId: 'org_nori', organization: 'Nori Market KK', owner: 'Aiko Mori', type: 'bestshopio', lifecycle: 'Active', plan: 'Commerce Pro', region: 'JP', createdAt: 'Jun 2, 2026', provisioning: 'Completed', connection: 'Healthy', domainHealth: 'Healthy', domainSetup: 'Verified', paymentSetup: 'Configured', product: 'BestShopio', nextAction: 'No action required', shopify: '--', defaultDomain: 'nori-market.stores.bestshopio.com', primaryDomain: 'norimarket.com', payments: { configured: ['Airwallex'], active: ['Airwallex'] }, onboarding: { createdAt: 'Jun 2, 2026 09:00', paymentBoundAt: 'Jun 4, 2026 15:10', domainBoundAt: 'Jun 8, 2026 11:25', firstOrderAt: 'Jun 20, 2026 18:05' } }
    ],
    organizations: [
      { id: 'org_lavender', name: 'Lavender Labs Inc.', primary: 'Avery Wells', email: 'avery@lavenderlabs.com', stores: 1, status: 'Active', plan: 'Growth' },
      { id: 'org_folast', name: 'Folast Studio LLC', primary: 'Mia Chen', email: 'mia@folast-studio.com', stores: 1, status: 'Active', plan: 'Growth' },
      { id: 'org_heyjune', name: 'Hey June Co.', primary: 'June Park', email: 'june@heyjune.co', stores: 1, status: 'Active', plan: 'Starter' },
      { id: 'org_river', name: 'River Remedy Ltd.', primary: 'Riley Morgan', email: 'riley@riverremedy.com', stores: 1, status: 'Suspended', plan: 'Starter' },
      { id: 'org_northstar', name: 'Northstar Inc.', primary: 'Sam Reed', email: 'sam@northstar.demo', stores: 1, status: 'Provisioning', plan: 'Starter' },
      { id: 'org_atelier', name: 'Atelier Studio', primary: 'Iris Cole', email: 'iris@atelier.demo', stores: 1, status: 'Provisioning', plan: 'Starter' },
      { id: 'org_harbor', name: 'Harbor Goods Ltd.', primary: 'Noah Hale', email: 'noah@harbor.demo', stores: 1, status: 'Provisioning', plan: 'Starter' },
      { id: 'org_coral', name: 'Coral Goods Ltd.', primary: 'Lena Ortiz', email: 'lena@coral-goods.demo', stores: 1, status: 'Active', plan: 'Starter' },
      { id: 'org_silix', name: 'Silixwear Commerce Inc.', primary: 'Ryan Cole', email: 'ryan@silixwear.com', stores: 1, status: 'Active', plan: 'Commerce Pro' },
      { id: 'org_willow', name: 'Willow Atelier Ltd.', primary: 'Claire Dunn', email: 'claire@willowatelier.com', stores: 1, status: 'Active', plan: 'Commerce Pro' },
      { id: 'org_mira', name: 'Mira Botanics Inc.', primary: 'Priya Shah', email: 'priya@mira-botanics.com', stores: 1, status: 'Active', plan: 'Commerce Pro' },
      { id: 'org_oak', name: 'Oak & Ember Co.', primary: 'Ben Ortiz', email: 'ben@oakember.demo', stores: 1, status: 'Active', plan: 'Commerce Pro' },
      { id: 'org_lumen', name: 'Lumen Paper LLC', primary: 'Hannah Cho', email: 'hannah@lumenpaper.demo', stores: 1, status: 'Active', plan: 'Commerce Pro' },
      { id: 'org_northpine', name: 'Northpine Home GmbH', primary: 'Elena Fischer', email: 'elena@northpinehome.de', stores: 1, status: 'Active', plan: 'Commerce Pro' },
      { id: 'org_cedar', name: 'Cedar & Co Pty', primary: 'Tom Blake', email: 'tom@cedarco.demo', stores: 1, status: 'Active', plan: 'Commerce Pro' },
      { id: 'org_nori', name: 'Nori Market KK', primary: 'Aiko Mori', email: 'aiko@norimarket.com', stores: 1, status: 'Active', plan: 'Commerce Pro' }
    ],
    content: {
      spaces: [
        { id: 'bestcheckout_help', name: 'BestCheckout Help Center', audience: 'BestCheckout merchants', channel: 'Public help center', url: 'help.bestcheckout.com', defaultLocale: 'en-US', supportedLocales: ['en-US', 'zh-CN'], status: 'Live' },
        { id: 'bestshopio_help', name: 'BestShopio Help Center', audience: 'BestShopio merchants', channel: 'Public help center', url: 'help.bestshopio.com', defaultLocale: 'zh-CN', supportedLocales: ['zh-CN', 'en-US'], status: 'Live' },
        { id: 'platform_notice', name: 'Platform notices', audience: 'Merchants and staff', channel: 'In-app notice', url: 'In-app', defaultLocale: 'en-US', supportedLocales: ['en-US', 'zh-CN'], status: 'Live' }
      ],
      // Collections are the published Help Center navigation. Articles belong to
      // exactly one collection; an article outline is derived from its H2/H3 body
      // headings rather than being maintained as a second, divergent list.
      collections: [
        { id: 'hc_getting_started', spaceId: 'bestcheckout_help', name: 'Getting started', parentId: '', order: 100, status: 'Visible', description: 'Connect a store and complete initial setup.' },
        { id: 'hc_purchase_flows', spaceId: 'bestcheckout_help', name: 'Purchase flows', parentId: '', order: 90, status: 'Visible', description: 'Create, review and publish purchase flows.' },
        { id: 'hc_checkout_pages', spaceId: 'bestcheckout_help', name: 'Checkout pages', parentId: '', order: 80, status: 'Visible', description: 'Configure checkout-page content and behavior.' },
        { id: 'hc_orders_sync', spaceId: 'bestcheckout_help', name: 'Orders and Shopify sync', parentId: '', order: 70, status: 'Visible', description: 'Understand order status, sync and recovery.' },
        { id: 'hc_settings_team', spaceId: 'bestcheckout_help', name: 'Settings and team', parentId: '', order: 60, status: 'Visible', description: 'Manage access, integrations and account settings.' },
        { id: 'hc_reports', spaceId: 'bestcheckout_help', name: 'Reports', parentId: '', order: 50, status: 'Visible', description: 'Read conversion and operational reports.' },
        { id: 'bsh_store_setup', spaceId: 'bestshopio_help', name: '开店与基础设置', parentId: '', order: 100, status: 'Visible', description: '创建店铺、完成基础设置并准备发布。' },
        { id: 'bsh_domains', spaceId: 'bestshopio_help', name: '店铺与域名', parentId: '', order: 90, status: 'Visible', description: '管理店铺域名、DNS 与 SSL。' },
        { id: 'bsh_operations', spaceId: 'bestshopio_help', name: '运营与增长', parentId: '', order: 80, status: 'Visible', description: '了解商品、订单、客户和营销运营。' },
        { id: 'notice_service_updates', spaceId: 'platform_notice', name: 'Service updates', parentId: '', order: 100, status: 'Visible', description: 'Operational notices shown in product.' }
      ],
      articles: [
        { id: 'help_connect', translationKey: 'connect-shopify', spaceId: 'bestcheckout_help', collectionId: 'hc_getting_started', title: 'Connect your Shopify store', slug: 'connect-shopify', audience: 'BestCheckout merchants', locale: 'en-US', status: 'Published', updatedAt: 'Jul 28, 2026', owner: 'Mia / Content', body: '## Before you start\n\nUse a secure device and make sure you can access the Shopify admin for the store you will connect. You only need your myshopify.com address, Client ID and Client secret at the end.\n\n## 1. Open App development in Shopify admin\n\nIn Shopify admin, go to Settings → Apps → Develop apps, then open the Dev Dashboard for the store organization.\n\n## 2. Create the Dev Dashboard app\n\nCreate an app for this store and keep its credentials with the merchant team. Do not paste a Client secret into chat, email or source code.\n\n## 3. Copy the Client ID and Client secret\n\nCopy the values only when you are ready to connect them in BestCheckout.\n\n## 4. Connect the same store in BestCheckout\n\nReturn to BestCheckout and complete the connection for the same Shopify store.' },
        { id: 'help_payment', space: 'BestCheckout Help Center', collectionId: 'hc_getting_started', collection: 'Getting started', title: 'Set up payment services', slug: 'payment-services', audience: 'BestCheckout merchants', locale: 'en-US', status: 'Published', updatedAt: 'Jul 26, 2026', owner: 'Mia / Content', body: '## Before you connect a payment service\n\nConfirm that you have access to the payment provider account and that the checkout domain is ready for verification.\n\n## 1. Choose the payment service\n\nSelect the provider that is available for the store, currency and checkout market.\n\n## 2. Complete the secure connection\n\nFollow the provider authorization flow. Credentials stay with the provider connection and are not displayed in reports.\n\n## 3. Verify the payment route\n\nRun the available test or readiness check before publishing a purchase flow.' },
        { id: 'help_domain', space: 'BestCheckout Help Center', collectionId: 'hc_getting_started', collection: 'Getting started', title: 'Set your checkout domain', slug: 'checkout-domain', audience: 'BestCheckout merchants', locale: 'en-US', status: 'Published', updatedAt: 'Jul 26, 2026', owner: 'Mia / Content', body: '## Choose a checkout host\n\nUse a dedicated checkout host that belongs to the store. A checkout host never renders storefront pages.\n\n## 1. Add the host in BestCheckout\n\nEnter the host that should receive checkout traffic and copy the DNS verification record.\n\n## 2. Verify DNS and SSL\n\nWait for DNS verification and certificate issuance to complete before using the host in a live route.\n\n## 3. Publish after verification\n\nAssign the verified host to the intended purchase flow and preview it before publishing.' },
        { id: 'help_publish', space: 'BestCheckout Help Center', collectionId: 'hc_purchase_flows', collection: 'Purchase flows', title: 'Publish, pause and preview', slug: 'publish-preview', audience: 'BestCheckout merchants', locale: 'en-US', status: 'In review', updatedAt: 'Jul 29, 2026', owner: 'Avery / Product', body: '## Preview before publishing\n\nReview the purchase flow, checkout page, offer rules and payment route together before sending traffic.\n\n## Publish a purchase flow\n\nPublishing creates a governed deployment snapshot. Use the preview URL to confirm the expected customer path.\n\n## Pause safely\n\nPausing stops new traffic from entering the flow. Existing payment sessions are not altered.\n\n## Resume after review\n\nResume only after the connection, domain and runtime checks are healthy.' },
        { id: 'help_bestshopio_create_store', space: 'BestShopio Help Center', collectionId: 'bsh_store_setup', collection: '开店与基础设置', title: '创建你的 BestShopio 店铺', slug: 'create-bestshopio-store', audience: 'BestShopio merchants', locale: 'zh-CN', status: 'Published', updatedAt: 'Jul 30, 2026', owner: 'Lynn / Content', body: '## 开始前准备\n\n请确认你拥有可用的组织账号，并准备好店铺名称、主营市场和基础品牌信息。\n\n## 创建店铺\n\n在店铺列表中选择创建店铺，填写名称并选择对应套餐。系统会为店铺建立独立的经营记录。\n\n### 确认负责人\n\n请指定可以接收开店进度和异常提醒的主要联系人。\n\n## 完成基础设置\n\n进入商家后台后，继续完善商品、支付、物流和店铺内容，再开始发布。' },
        { id: 'help_bestshopio_domain', space: 'BestShopio Help Center', collectionId: 'bsh_domains', collection: '店铺与域名', title: 'Connect a custom storefront domain', slug: 'connect-custom-storefront-domain', audience: 'BestShopio merchants', locale: 'en-US', status: 'Draft', updatedAt: 'Jul 30, 2026', owner: 'Lynn / Content', body: '## Before you connect a domain\n\nChoose a host used for your storefront. A storefront host and a checkout host have separate purposes.\n\n## Add the storefront host\n\nAdd the domain in BestShopio Domains, then copy the required DNS record to your domain provider.\n\n## Verify DNS and SSL\n\nWait until verification and certificate issuance are complete before publishing the storefront.' },
        { id: 'notice_fallback', space: 'Platform notices', collectionId: 'notice_service_updates', collection: 'Service updates', title: 'Shopify authorization recovery notice', slug: 'shopify-reauthorization', audience: 'Affected merchants', locale: 'en-US', status: 'Draft', updatedAt: 'Jul 29, 2026', owner: 'Ops', body: '## What happened\n\nThe Shopify authorization for this store is no longer active.\n\n## What stays safe\n\nNew checkout traffic stays on the Shopify-native path until the merchant reconnects.\n\n## What to do next\n\nAsk the store owner to complete the guided reconnection from BestCheckout.' }
      ],
      feedback: { noResultSearches: 18, helpfulRate: '86%', staleArticles: 1 }
    },
    hosts: [
      { id: 'host_001', host: 'checkout.lavenderlabs.com', storeId: 'shop_lavender', store: 'Lavender Labs', usage: 'checkout', target: 'edge.bestcheckout.app', dns: 'Verified', ssl: 'Active', status: 'Live', updatedAt: '2 min ago' },
      { id: 'host_002', host: 'www.lavenderlabs.com', storeId: 'shop_lavender', store: 'Lavender Labs', usage: 'storefront', target: 'stores.bestshopio.com', dns: 'Verified', ssl: 'Active', status: 'Live', updatedAt: 'Jun 18' },
      { id: 'host_003', host: 'checkout.folast-studio.com', storeId: 'shop_folast', store: 'Folast Studio', usage: 'checkout', target: 'edge.bestcheckout.app', dns: 'Verified', ssl: 'Active', status: 'Live', updatedAt: '18 min ago' },
      { id: 'host_004', host: 'shop.folaststudio.com', storeId: 'shop_folast', store: 'Folast Studio', usage: 'storefront', target: 'stores.bestshopio.com', dns: 'Verified', ssl: 'Active', status: 'Live', updatedAt: 'Jul 02' },
      { id: 'host_005', host: 'heyjune.checkout.bestcheckout.app', storeId: 'shop_heyjune', store: 'Hey June', usage: 'checkout', target: 'edge.bestcheckout.app', dns: 'Verified', ssl: 'Active', status: 'Live', updatedAt: '5 min ago' },
      { id: 'host_006', host: 'shop.northpinehome.de', storeId: 'store_northpine', store: 'Northpine Home', usage: 'storefront', target: 'stores.bestshopio.com', dns: 'Pending', ssl: 'Pending', status: 'Provisioning', updatedAt: '12 min ago' },
      { id: 'host_007', host: 'checkout.coral-goods.com', storeId: 'shop_coral', store: 'Coral Goods', usage: 'checkout', target: 'edge.bestcheckout.app', dns: 'Pending', ssl: 'Pending', status: 'Provisioning', updatedAt: '3 hours ago' },
      { id: 'host_008', host: 'silixwear.com', storeId: 'store_silixwear', store: 'Silixwear', usage: 'storefront', target: 'stores.bestshopio.com', dns: 'Verified', ssl: 'Active', status: 'Live', updatedAt: 'May 20' },
      { id: 'host_009', host: 'willowatelier.com', storeId: 'store_willow', store: 'Willow Atelier', usage: 'storefront', target: 'stores.bestshopio.com', dns: 'Verified', ssl: 'Active', status: 'Live', updatedAt: 'Aug 5' },
      { id: 'host_010', host: 'mira-botanics.com', storeId: 'store_mira', store: 'Mira Botanics', usage: 'storefront', target: 'stores.bestshopio.com', dns: 'Verified', ssl: 'Active', status: 'Live', updatedAt: 'Aug 18' },
      { id: 'host_011', host: 'norimarket.com', storeId: 'store_nori', store: 'Nori Market', usage: 'storefront', target: 'stores.bestshopio.com', dns: 'Verified', ssl: 'Active', status: 'Live', updatedAt: 'Jun 8' }
    ],
    integrations: [
      { id: 'int_001', provider: 'Shopify', connection: 'Lavender Labs', storeId: 'shop_lavender', capability: 'Catalog, customers, orders, webhooks', status: 'Healthy', secret: 'Credential reference only', checked: '2 min ago' },
      { id: 'int_002', provider: 'Shopify', connection: 'Folast Studio', storeId: 'shop_folast', capability: 'Catalog, customers, orders, webhooks', status: 'Needs attention', secret: 'Credential reference only', checked: '11 min ago' },
      { id: 'int_003', provider: 'Stripe', connection: 'Lavender Labs live', storeId: 'shop_lavender', capability: 'Cards, wallets, payment webhooks', status: 'Healthy', secret: 'Credential reference only', checked: '1 min ago' },
      { id: 'int_004', provider: 'Airwallex', connection: 'Folast Studio live', storeId: 'shop_folast', capability: 'Cards, Apple Pay, payment webhooks', status: 'Healthy', secret: 'Credential reference only', checked: '8 min ago' },
      { id: 'int_006', provider: 'Stripe', connection: 'Hey June live', storeId: 'shop_heyjune', capability: 'Cards, Link, payment webhooks', status: 'Healthy', secret: 'Credential reference only', checked: '4 min ago' },
      { id: 'int_007', provider: 'Airwallex', connection: 'Silixwear live', storeId: 'store_silixwear', capability: 'Cards, wallets, payment webhooks', status: 'Healthy', secret: 'Credential reference only', checked: '12 min ago' },
      { id: 'int_008', provider: 'Stripe', connection: 'Northpine Home live', storeId: 'store_northpine', capability: 'Cards, SEPA, payment webhooks', status: 'Healthy', secret: 'Credential reference only', checked: '12 min ago' },
      { id: 'int_009', provider: 'Stripe', connection: 'Willow Atelier live', storeId: 'store_willow', capability: 'Cards, wallets, payment webhooks', status: 'Healthy', secret: 'Credential reference only', checked: '1 day ago' },
      { id: 'int_010', provider: 'PayPal', connection: 'Oak & Ember live', storeId: 'store_oak', capability: 'Wallet, cards, payment webhooks', status: 'Healthy', secret: 'Credential reference only', checked: '2 days ago' },
      { id: 'int_011', provider: 'Stripe', connection: 'Lumen Paper live', storeId: 'store_lumen', capability: 'Cards, Link, payment webhooks', status: 'Healthy', secret: 'Credential reference only', checked: '6 hours ago' },
      { id: 'int_012', provider: 'Airwallex', connection: 'Nori Market live', storeId: 'store_nori', capability: 'Cards, wallets, payment webhooks', status: 'Healthy', secret: 'Credential reference only', checked: '3 days ago' },
      { id: 'int_005', provider: 'Shopify', connection: 'River Remedy', storeId: 'shop_river', capability: 'Authorization and webhooks', status: 'Action required', secret: 'Credential reference only', checked: '35 min ago' }
    ],
    actionItems: [
      { id: 'act_001', severity: 'High', domain: 'Connection', storeId: 'shop_river', store: 'River Remedy', title: 'Shopify authorization was revoked', detail: 'Checkout is safely on Shopify native control. Ask the merchant to reconnect.', owner: 'Merchant success', state: 'Waiting for merchant', action: 'Stage reconnection request' },
      { id: 'act_002', severity: 'High', domain: 'Order writeback', storeId: 'shop_heyjune', store: 'Hey June', title: 'One paid order awaits idempotent replay', detail: 'The Shopify acknowledgement timed out. The original idempotency key is preserved.', owner: 'Commerce ops', state: 'Retryable', action: 'Replay writeback' },
      { id: 'act_003', severity: 'Medium', domain: 'Catalog sync', storeId: 'shop_folast', store: 'Folast Studio', title: 'Offer references a replaced Shopify variant', detail: 'Map a live replacement variant and revalidate the offer rule.', owner: 'Commerce ops', state: 'Action required', action: 'Map replacement' },
      { id: 'act_004', severity: 'Medium', domain: 'Domain', storeId: 'store_northpine', store: 'Northpine Home', title: 'Storefront DNS verification is pending', detail: 'The host has not been verified, so the storefront cannot be published.', owner: 'Provisioning', state: 'Waiting for DNS', action: 'Check DNS' },
      { id: 'act_006', severity: 'Medium', domain: 'Payments', storeId: 'store_mira', store: 'Mira Botanics', title: 'No payment provider is connected', detail: 'The custom domain is live, but checkout cannot take payment until a provider is connected.', owner: 'Provisioning', state: 'Waiting for merchant', action: 'Connect payment' },
      { id: 'act_007', severity: 'Low', domain: 'Domain', storeId: 'store_oak', store: 'Oak & Ember', title: 'Store is still on the default domain', detail: 'Payment is connected. The store can take orders on the default host until a custom domain is bound.', owner: 'Provisioning', state: 'Open', action: 'Connect domain' },
      { id: 'act_008', severity: 'Medium', domain: 'Setup', storeId: 'store_cedar', store: 'Cedar & Co', title: 'New store has not finished setup', detail: 'Payment and a custom storefront domain are both still outstanding.', owner: 'Ops', state: 'Open', action: 'Open store' },
      { id: 'act_005', severity: 'Low', domain: 'Content', storeId: '', store: 'BestCheckout Help Center', title: 'One published help article needs review', detail: 'The checkout-domain guide references an older DNS screenshot.', owner: 'Content', state: 'Open', action: 'Open article' }
    ],
    plans: [
      { id: 'plan_starter', name: 'Starter', products: 'BestCheckout', seats: 3, flows: 3, domains: 1, analytics: '30 days', status: 'Live' },
      { id: 'plan_growth', name: 'Growth', products: 'BestCheckout', seats: 10, flows: 'Unlimited', domains: 3, analytics: '24 months', status: 'Live' },
      { id: 'plan_commerce', name: 'Commerce Pro', products: 'BestShopio + BestCheckout', seats: 20, flows: 'Unlimited', domains: 10, analytics: 'Unlimited', status: 'Live' }
    ],
    flags: [
      { id: 'flag_checkout_safety', name: 'Checkout safety preflight', scope: 'All BestCheckout stores', status: 'Enabled', changedBy: 'ops.amy', updatedAt: 'Jul 29, 09:10' },
      { id: 'flag_help_search', name: 'Help Center search feedback', scope: 'BestCheckout Help Center', status: 'Enabled', changedBy: 'mia.content', updatedAt: 'Jul 28, 15:34' },
      { id: 'flag_upgrade', name: 'Controlled BestShopio upgrade', scope: 'Selected pilot stores', status: 'Pilot', changedBy: 'ryan', updatedAt: 'Jul 27, 11:22' }
    ],
    audit: [
      { at: 'Jul 29, 10:24', actor: 'ops.amy', action: 'Replayed a Shopify webhook', scope: 'Folast Studio', result: 'Queued for acknowledgement' },
      { at: 'Jul 29, 09:10', actor: 'ops.amy', action: 'Updated checkout safety preflight', scope: 'All BestCheckout stores', result: 'Published' },
      { at: 'Jul 28, 15:34', actor: 'mia.content', action: 'Published help article', scope: 'Connect your Shopify store', result: 'Live' }
    ],
    storeOps: {
      shop_lavender: {
        kind: 'bestcheckout',
        flowsTotal: 11, flowsActive: 3, flowsLive: 3, flowsDraft: 6, flowStatus: 'Healthy', flowNote: 'Sleep Reset takes 72% of checkout traffic',
        pagesTotal: 12, pagesActive: 9, pageStatus: 'Healthy',
        bundlesTotal: 3, bundlesActive: 2, bundles: 2, bundleStatus: 'Bundle created', bundleNote: 'Sleep Reset Bundle · Daily essentials',
        subsTotal: 8, subsSynced: 6, subsCreated: 2, subStatus: 'Healthy',
        contracts: 9, contractsActive: 7, contractsPastDue: 1, contractsCancelled: 1,
        ordersTotal: 928, ordersSynced: 924, orders7d: 186, orders30d: 742, gmv: '$44,620', gmv7d: '$8,940', aov: '$48.08', orderStatus: 'Healthy', orderNote: '1 writeback completed in the last hour',
        flows: [
          { name: 'Sleep Reset', state: 'Live', priority: 300, funnelType: 'Checkout → Upsell → Downsell → Thank you', traffic: '72%', conversion: '4.8%', aov: '$54.20' },
          { name: 'Refill recovery', state: 'Live', priority: 200, funnelType: 'Checkout → Upsell → Thank you', traffic: '18%', conversion: '3.9%', aov: '$46.10' },
          { name: 'Welcome offer', state: 'Live', priority: 100, funnelType: 'Checkout A/B → Thank you', traffic: '10%', conversion: '3.2%', aov: '$41.80' },
          { name: 'Loyalty refill', state: 'Paused', priority: 90, funnelType: 'Checkout → Upsell → Thank you', traffic: '—', conversion: '—', aov: '—' },
          { name: 'Holiday gift set', state: 'Paused', priority: 80, funnelType: 'Checkout → Upsell → Downsell → Thank you', traffic: '—', conversion: '—', aov: '—' },
          { name: 'First order A/B', state: 'Draft', priority: 60, funnelType: 'Checkout A/B → Thank you', traffic: '—', conversion: '—', aov: '—' },
          { name: 'Night serum launch', state: 'Draft', priority: 50, funnelType: 'Checkout → Upsell → Thank you', traffic: '—', conversion: '—', aov: '—' },
          { name: 'Email returning', state: 'Draft', priority: 40, funnelType: 'Checkout → Thank you', traffic: '—', conversion: '—', aov: '—' },
          { name: 'SMS winback', state: 'Draft', priority: 30, funnelType: 'Checkout → Downsell → Thank you', traffic: '—', conversion: '—', aov: '—' },
          { name: 'Bundle attach', state: 'Draft', priority: 20, funnelType: 'Checkout → Upsell → Thank you', traffic: '—', conversion: '—', aov: '—' },
          { name: 'Post-purchase quiz', state: 'Draft', priority: 10, funnelType: 'Checkout → Thank you', traffic: '—', conversion: '—', aov: '—' }
        ],
        syncStatus: 'Healthy', syncNote: 'Shopify catalog pull and order writeback', syncDetail: '6 pull types healthy', syncChecked: '2 min ago',
        syncItems: [
          { name: 'Products, variants & inventory', status: 'Healthy', note: '1,284 products · last pull 2 min ago' },
          { name: 'Collections', status: 'Healthy', note: '48 collections · last pull 2 min ago' },
          { name: 'Customers', status: 'Healthy', note: '6,102 customers · last pull 2 min ago' },
          { name: 'Discounts', status: 'Healthy', note: '23 discounts · last pull 2 min ago' },
          { name: 'Shipping rates', status: 'Healthy', note: '9 profiles · last pull 2 min ago' },
          { name: 'Store settings', status: 'Healthy', note: 'USD · GMT-04:00 · last pull 2 min ago' },
          { name: 'Subscriptions', status: 'Healthy', note: '6 already synced · 2 created here · last pull 2 min ago' },
          { name: 'Order writeback', status: 'Healthy', note: '1 writeback completed in the last hour' }
        ]
      },
      shop_folast: {
        kind: 'bestcheckout',
        flowsTotal: 3, flowsActive: 1, flowsLive: 1, flowsDraft: 1, flowStatus: 'Healthy', flowNote: 'Seasonal bundle is paused while two variants are remapped',
        pagesTotal: 8, pagesActive: 6, pageStatus: 'Healthy',
        bundlesTotal: 1, bundlesActive: 1, bundles: 1, bundleStatus: 'Bundle created', bundleNote: 'Seasonal linen bundle',
        subsTotal: 4, subsSynced: 3, subsCreated: 1, subStatus: 'Healthy',
        contracts: 3, contractsActive: 2, contractsPastDue: 1, contractsCancelled: 0,
        ordersTotal: 381, ordersSynced: 381, orders7d: 94, orders30d: 381, gmv: '$21,120', gmv7d: '$5,210', aov: '$55.43', orderStatus: 'Healthy', orderNote: 'Orders are completing; catalog mapping needs attention',
        flows: [
          { name: 'Seasonal bundle', state: 'Paused', priority: 200, funnelType: 'Checkout → Upsell → Downsell → Thank you', traffic: '—', conversion: '—', aov: '—' },
          { name: 'Linen restock', state: 'Live', priority: 100, funnelType: 'Checkout → Upsell → Thank you', traffic: '100%', conversion: '4.2%', aov: '$51.20' },
          { name: 'Fall preview', state: 'Draft', priority: 50, funnelType: 'Checkout A/B → Thank you', traffic: '—', conversion: '—', aov: '—' }
        ],
        syncStatus: 'Needs attention', syncNote: 'Catalog mapping needs attention', syncDetail: '2 variant mappings need a replacement', syncChecked: '11 min ago',
        syncItems: [
          { name: 'Products, variants & inventory', status: 'Needs attention', note: '2 variant mappings need a replacement' },
          { name: 'Collections', status: 'Healthy', note: 'Last pull 11 min ago' },
          { name: 'Customers', status: 'Healthy', note: 'Last pull 11 min ago' },
          { name: 'Discounts', status: 'Healthy', note: 'Last pull 11 min ago' },
          { name: 'Shipping rates', status: 'Healthy', note: 'Last pull 11 min ago' },
          { name: 'Store settings', status: 'Healthy', note: 'USD · GMT-04:00 · last pull 11 min ago' },
          { name: 'Subscriptions', status: 'Healthy', note: '3 already synced · 1 created here · last pull 11 min ago' },
          { name: 'Order writeback', status: 'Healthy', note: 'Latest writeback completed 18 min ago' }
        ]
      },
      shop_heyjune: {
        kind: 'bestcheckout',
        flowsTotal: 2, flowsActive: 1, flowsLive: 1, flowsDraft: 1, flowStatus: 'Healthy', flowNote: 'Refill recovery is the only live flow',
        pagesTotal: 6, pagesActive: 4, pageStatus: 'Healthy',
        bundlesTotal: 0, bundlesActive: 0, bundles: 0, bundleStatus: 'None', bundleNote: 'No bundle created',
        subsTotal: 3, subsSynced: 2, subsCreated: 1, subStatus: 'Healthy',
        contracts: 2, contractsActive: 1, contractsPastDue: 1, contractsCancelled: 0,
        ordersTotal: 168, ordersSynced: 167, orders7d: 41, orders30d: 168, gmv: '$6,720', gmv7d: '$1,640', aov: '$40.00', orderStatus: 'Needs attention', orderNote: '1 paid order could not be created in Shopify',
        flows: [
          { name: 'Refill recovery', state: 'Live', priority: 100, funnelType: 'Checkout → Upsell → Thank you', traffic: '100%', conversion: '3.6%', aov: '$40.00' },
          { name: 'Welcome kit', state: 'Draft', priority: 50, funnelType: 'Checkout → Thank you', traffic: '—', conversion: '—', aov: '—' }
        ],
        syncStatus: 'Needs attention', syncNote: 'Writeback retry pending', syncDetail: '1 writeback retry pending', syncChecked: '5 min ago',
        syncItems: [
          { name: 'Products, variants & inventory', status: 'Healthy', note: 'Last pull 5 min ago' },
          { name: 'Collections', status: 'Healthy', note: 'Last pull 5 min ago' },
          { name: 'Customers', status: 'Healthy', note: 'Last pull 5 min ago' },
          { name: 'Discounts', status: 'Healthy', note: 'Last pull 5 min ago' },
          { name: 'Shipping rates', status: 'Healthy', note: 'Last pull 5 min ago' },
          { name: 'Store settings', status: 'Healthy', note: 'USD · GMT-04:00 · last pull 5 min ago' },
          { name: 'Subscriptions', status: 'Healthy', note: '2 already synced · 1 created here · last pull 5 min ago' },
          { name: 'Order writeback', status: 'Needs attention', note: '1 paid order could not be created in Shopify' }
        ]
      },
      shop_coral: {
        kind: 'bestcheckout',
        flowsTotal: 0, flowsActive: 0, flowsLive: 0, flowsDraft: 0, flowStatus: 'Pending', flowNote: 'No purchase flow yet',
        pagesTotal: 0, pagesActive: 0, pageStatus: 'Pending',
        bundlesTotal: 0, bundlesActive: 0, bundles: 0, bundleStatus: 'None', bundleNote: 'No bundle created',
        subsTotal: 0, subsSynced: 0, subsCreated: 0, subStatus: 'Pending',
        contracts: 0,
        ordersTotal: 0, ordersSynced: 0, orders7d: 0, orders30d: 0, gmv: '$0', gmv7d: '$0', aov: '$0', orderStatus: 'Pending', orderNote: 'Checkout is not live until setup is finished',
        flows: [],
        syncStatus: 'Healthy', syncNote: 'Catalog imported', syncDetail: 'Checkout is waiting for domain and payment', syncChecked: '3 hours ago',
        syncItems: [
          { name: 'Products, variants & inventory', status: 'Healthy', note: 'Catalog imported · last pull 3 hours ago' },
          { name: 'Collections', status: 'Healthy', note: 'Last pull 3 hours ago' },
          { name: 'Customers', status: 'Healthy', note: 'Last pull 3 hours ago' },
          { name: 'Discounts', status: 'Healthy', note: 'Last pull 3 hours ago' },
          { name: 'Shipping rates', status: 'Healthy', note: 'Last pull 3 hours ago' },
          { name: 'Store settings', status: 'Healthy', note: 'USD · GMT-04:00 · last pull 3 hours ago' },
          { name: 'Subscriptions', status: 'Pending', note: 'No subscriptions yet' },
          { name: 'Order writeback', status: 'Pending', note: 'Writeback starts after the first paid order' }
        ]
      },
      shop_atelier: {
        kind: 'bestcheckout',
        flowsTotal: 0, flowsActive: 0, flowsLive: 0, flowsDraft: 0, flowStatus: 'Waiting', flowNote: 'No purchase flow yet',
        pagesTotal: 0, pagesActive: 0, pageStatus: 'Waiting',
        bundlesTotal: 0, bundlesActive: 0, bundles: 0, bundleStatus: 'None', bundleNote: 'No bundle created',
        subsTotal: 0, subsSynced: 0, subsCreated: 0, subStatus: 'Waiting',
        contracts: 0,
        ordersTotal: 0, ordersSynced: 0, orders7d: 0, orders30d: 0, gmv: '$0', gmv7d: '$0', aov: '$0', orderStatus: 'Waiting', orderNote: 'Starts after the store is connected',
        flows: [],
        syncStatus: 'Waiting', syncNote: 'Shopify catalog pull and order writeback', syncDetail: 'Sync starts after the store is connected', syncChecked: '',
        syncItems: [
          { name: 'Products, variants & inventory', status: 'Waiting', note: 'Starts after the store is connected' },
          { name: 'Collections', status: 'Waiting', note: 'Starts after the store is connected' },
          { name: 'Customers', status: 'Waiting', note: 'Starts after the store is connected' },
          { name: 'Discounts', status: 'Waiting', note: 'Starts after the store is connected' },
          { name: 'Shipping rates', status: 'Waiting', note: 'Starts after the store is connected' },
          { name: 'Store settings', status: 'Waiting', note: 'Starts after the store is connected' },
          { name: 'Subscriptions', status: 'Waiting', note: 'Starts after the store is connected' },
          { name: 'Order writeback', status: 'Waiting', note: 'Starts after the store is connected' }
        ]
      },
      shop_northstar: {
        kind: 'bestcheckout',
        flowsTotal: 0, flowsActive: 0, flowsLive: 0, flowsDraft: 0, flowStatus: 'Waiting', flowNote: 'No purchase flow yet',
        pagesTotal: 0, pagesActive: 0, pageStatus: 'Waiting',
        bundlesTotal: 0, bundlesActive: 0, bundles: 0, bundleStatus: 'None', bundleNote: 'No bundle created',
        subsTotal: 0, subsSynced: 0, subsCreated: 0, subStatus: 'Waiting',
        contracts: 0,
        ordersTotal: 0, ordersSynced: 0, orders7d: 0, orders30d: 0, gmv: '$0', gmv7d: '$0', aov: '$0', orderStatus: 'Waiting', orderNote: 'Starts after the store is connected',
        flows: [],
        syncStatus: 'Waiting', syncNote: 'Shopify catalog pull and order writeback', syncDetail: 'Sync starts after the store is connected', syncChecked: '',
        syncItems: [
          { name: 'Products, variants & inventory', status: 'Waiting', note: 'Starts after the store is connected' },
          { name: 'Collections', status: 'Waiting', note: 'Starts after the store is connected' },
          { name: 'Customers', status: 'Waiting', note: 'Starts after the store is connected' },
          { name: 'Discounts', status: 'Waiting', note: 'Starts after the store is connected' },
          { name: 'Shipping rates', status: 'Waiting', note: 'Starts after the store is connected' },
          { name: 'Store settings', status: 'Waiting', note: 'Starts after the store is connected' },
          { name: 'Subscriptions', status: 'Waiting', note: 'Starts after the store is connected' },
          { name: 'Order writeback', status: 'Waiting', note: 'Starts after the store is connected' }
        ]
      },
      shop_harbor: {
        kind: 'bestcheckout',
        flowsTotal: 0, flowsActive: 0, flowsLive: 0, flowsDraft: 0, flowStatus: 'Waiting', flowNote: 'No purchase flow yet',
        pagesTotal: 0, pagesActive: 0, pageStatus: 'Waiting',
        bundlesTotal: 0, bundlesActive: 0, bundles: 0, bundleStatus: 'None', bundleNote: 'No bundle created',
        subsTotal: 0, subsSynced: 0, subsCreated: 0, subStatus: 'Waiting',
        contracts: 0,
        ordersTotal: 0, ordersSynced: 0, orders7d: 0, orders30d: 0, gmv: '$0', gmv7d: '$0', aov: '$0', orderStatus: 'Waiting', orderNote: 'Starts after the store is connected',
        flows: [],
        syncStatus: 'Waiting', syncNote: 'Shopify catalog pull and order writeback', syncDetail: 'Sync starts after the store is connected', syncChecked: '',
        syncItems: [
          { name: 'Products, variants & inventory', status: 'Waiting', note: 'Starts after the store is connected' },
          { name: 'Collections', status: 'Waiting', note: 'Starts after the store is connected' },
          { name: 'Customers', status: 'Waiting', note: 'Starts after the store is connected' },
          { name: 'Discounts', status: 'Waiting', note: 'Starts after the store is connected' },
          { name: 'Shipping rates', status: 'Waiting', note: 'Starts after the store is connected' },
          { name: 'Store settings', status: 'Waiting', note: 'Starts after the store is connected' },
          { name: 'Subscriptions', status: 'Waiting', note: 'Starts after the store is connected' },
          { name: 'Order writeback', status: 'Waiting', note: 'Starts after the store is connected' }
        ]
      },
      shop_river: {
        kind: 'bestcheckout',
        flowsTotal: 1, flowsActive: 0, flowsLive: 0, flowsDraft: 1, flowStatus: 'Paused', flowNote: 'Checkout is on Shopify native only',
        pagesTotal: 4, pagesActive: 0, pageStatus: 'Paused',
        bundlesTotal: 0, bundlesActive: 0, bundles: 0, bundleStatus: 'None', bundleNote: 'No live bundle',
        subsTotal: 0, subsSynced: 0, subsCreated: 0, subStatus: 'Paused',
        contracts: 0,
        ordersTotal: 12, ordersSynced: 12, orders7d: 0, orders30d: 12, gmv: '$480', gmv7d: '$0', aov: '$40.00', orderStatus: 'Paused', orderNote: 'New BestCheckout orders are blocked until reconnection',
        flows: [],
        syncStatus: 'Paused', syncNote: 'Blocked by authorization', syncDetail: 'No new catalog pulls or writeback', syncChecked: '35 min ago',
        syncItems: [
          { name: 'Products, variants & inventory', status: 'Paused', note: 'No new catalog pulls until Shopify is reconnected' },
          { name: 'Collections', status: 'Paused', note: 'No new collection pulls until Shopify is reconnected' },
          { name: 'Customers', status: 'Paused', note: 'No new customer pulls until Shopify is reconnected' },
          { name: 'Discounts', status: 'Paused', note: 'No new discount pulls until Shopify is reconnected' },
          { name: 'Shipping rates', status: 'Paused', note: 'No new shipping pulls until Shopify is reconnected' },
          { name: 'Store settings', status: 'Paused', note: 'No new store setting pulls until Shopify is reconnected' },
          { name: 'Subscriptions', status: 'Paused', note: 'No new subscription pulls until Shopify is reconnected' },
          { name: 'Order writeback', status: 'Paused', note: 'Writeback is paused' }
        ]
      },
      store_silixwear: {
        kind: 'bestshopio',
        products: 128, productsLive: 86,
        collections: 14, collectionsPublished: 12,
        customers: 1842,
        discounts: 9, discountsActive: 5,
        reviews: 96, reviewsPending: 8,
        ordersTotal: 251, orders7d: 63, orders30d: 251, gmv: '$16,650', gmv7d: '$4,180', aov: '$66.35'
      },
      store_willow: {
        kind: 'bestshopio',
        products: 56, productsLive: 40,
        collections: 7, collectionsPublished: 6,
        customers: 12,
        discounts: 3, discountsActive: 2,
        reviews: 0, reviewsPending: 0,
        ordersTotal: 0, orders7d: 0, orders30d: 0, gmv: '$0', gmv7d: '$0', aov: '$0'
      },
      store_mira: {
        kind: 'bestshopio',
        products: 22, productsLive: 18,
        collections: 4, collectionsPublished: 3,
        customers: 6,
        discounts: 1, discountsActive: 0,
        reviews: 2, reviewsPending: 1,
        ordersTotal: 0, orders7d: 0, orders30d: 0, gmv: '$0', gmv7d: '$0', aov: '$0'
      },
      store_oak: {
        kind: 'bestshopio',
        products: 14, productsLive: 9,
        collections: 2, collectionsPublished: 1,
        customers: 3,
        discounts: 1, discountsActive: 1,
        reviews: 0, reviewsPending: 0,
        ordersTotal: 0, orders7d: 0, orders30d: 0, gmv: '$0', gmv7d: '$0', aov: '$0'
      },
      store_lumen: {
        kind: 'bestshopio',
        products: 41, productsLive: 33,
        collections: 5, collectionsPublished: 4,
        customers: 86,
        discounts: 4, discountsActive: 2,
        reviews: 19, reviewsPending: 3,
        ordersTotal: 38, orders7d: 5, orders30d: 21, gmv: '$2,140', gmv7d: '$280', aov: '$56.32'
      },
      store_northpine: {
        kind: 'bestshopio',
        products: 6, productsLive: 0,
        collections: 1, collectionsPublished: 0,
        customers: 0,
        discounts: 0, discountsActive: 0,
        reviews: 0, reviewsPending: 0,
        ordersTotal: 0, orders7d: 0, orders30d: 0, gmv: '$0', gmv7d: '$0', aov: '$0'
      },
      store_cedar: {
        kind: 'bestshopio',
        products: 0, productsLive: 0,
        collections: 0, collectionsPublished: 0,
        customers: 0,
        discounts: 0, discountsActive: 0,
        reviews: 0, reviewsPending: 0,
        ordersTotal: 0, orders7d: 0, orders30d: 0, gmv: '$0', gmv7d: '$0', aov: '$0'
      },
      store_nori: {
        kind: 'bestshopio',
        products: 73, productsLive: 61,
        collections: 8, collectionsPublished: 7,
        customers: 640,
        discounts: 6, discountsActive: 3,
        reviews: 54, reviewsPending: 11,
        ordersTotal: 119, orders7d: 9, orders30d: 34, gmv: '$8,420', gmv7d: '$640', aov: '$70.76'
      }
    }
  };

  // ---- BestCheckout 运维台：平台控制面，不复制商家后台 ----
  // 记录只通过 storeId 关联 Store 主数据；不在这里维护漏斗草稿、页面内容或支付密钥。
  const bestcheckoutControl = {
    connections: [
      { id: 'bc_conn_lavender', storeId: 'shop_lavender', adapter: 'Shopify Integration Adapter', authorization: 'Connected', scopes: 'Products · orders · customers', sync: 'Healthy', webhook: '5 / 5 healthy', checked: '2 min ago', next: 'No action required', installStatus: 'connected' },
      { id: 'bc_conn_folast', storeId: 'shop_folast', adapter: 'Shopify Integration Adapter', authorization: 'Connected', scopes: 'Products · orders · customers', sync: 'Needs attention', webhook: '1 delivery retry pending', checked: '11 min ago', next: 'Review event delivery', installStatus: 'connected' },
      { id: 'bc_conn_heyjune', storeId: 'shop_heyjune', adapter: 'Shopify Integration Adapter', authorization: 'Connected', scopes: 'Products · orders · customers', sync: 'Healthy', webhook: '5 / 5 healthy', checked: '5 min ago', next: 'No action required', installStatus: 'connected' },
      { id: 'bc_conn_river', storeId: 'shop_river', adapter: 'Shopify Integration Adapter', authorization: 'Reauthorization needed', scopes: 'Access paused', sync: 'Paused', webhook: 'Delivery paused', checked: '35 min ago', next: 'Create merchant reconnection task', installStatus: 'reauth' },
      { id: 'bc_conn_northstar', storeId: 'shop_northstar', adapter: 'Shopify Custom App', authorization: 'Not connected', scopes: 'Products · orders · customers · discounts · shipping · draft orders', sync: 'Not started', webhook: 'Not started', checked: '4 hours ago', next: 'Finish Custom App and send install link', installStatus: 'preparing' },
      { id: 'bc_conn_atelier', storeId: 'shop_atelier', adapter: 'Shopify Custom App', authorization: 'Not connected', scopes: 'Products · orders · customers · discounts · shipping · draft orders', sync: 'Not started', webhook: 'Not started', checked: '1 day ago', next: 'Waiting for merchant to install', installStatus: 'ready' },
      { id: 'bc_conn_harbor', storeId: 'shop_harbor', adapter: 'Shopify Custom App', authorization: 'Not connected', scopes: 'Products · orders · customers · discounts · shipping · draft orders', sync: 'Not started', webhook: 'Not started', checked: '6 days ago', next: 'Resend install link', installStatus: 'expired' },
      { id: 'bc_conn_coral', storeId: 'shop_coral', adapter: 'Shopify Integration Adapter', authorization: 'Connected', scopes: 'Products · orders · customers', sync: 'Healthy', webhook: '5 / 5 healthy', checked: '3 hours ago', next: 'Finish domain verification', installStatus: 'connected' }
    ],
    installs: [
      { id: 'bc_install_northstar', storeId: 'shop_northstar', shop: 'northstar.myshopify.com', status: 'preparing', submittedAt: 'Sep 6, 2026', linkSentAt: '', expiresAt: '', owner: 'Commerce ops', next: 'Finish Custom App and send install link', installLink: '', clientId: '', clientSecret: '', clientSecretSaved: false },
      { id: 'bc_install_atelier', storeId: 'shop_atelier', shop: 'atelier.myshopify.com', status: 'ready', submittedAt: 'Sep 1, 2026', linkSentAt: 'Sep 2, 2026', expiresAt: 'Sep 9, 2026', owner: 'Commerce ops', next: 'Waiting for merchant to install', clientId: '8f2c91a0b47d3e6c5a19d80e4b27c3f1', clientSecret: '7c3e19a5d80b4f27e6c1a0b47d3e8f2c', clientSecretSaved: true, installLink: 'https://atelier.myshopify.com/admin/oauth/authorize?client_id=8f2c91a0b47d3e6c5a19d80e4b27c3f1&scope=read_products&redirect_uri=https%3A%2F%2Fapi.stores.bestfulfill.tech%2Fsso%2Fsso%2Fbestcheckout%2Fshopify%2Fcallback&state=bc_atelier_ready1' },
      { id: 'bc_install_harbor', storeId: 'shop_harbor', shop: 'harbor.myshopify.com', status: 'expired', submittedAt: 'Aug 24, 2026', linkSentAt: 'Aug 25, 2026', expiresAt: 'Sep 1, 2026', owner: 'Commerce ops', next: 'Resend install link', clientId: '8f2c91a0b47d3e6c5a19d80e4b27c3f1', clientSecret: '7c3e19a5d80b4f27e6c1a0b47d3e8f2c', clientSecretSaved: true, installLink: 'https://harbor.myshopify.com/admin/oauth/authorize?client_id=8f2c91a0b47d3e6c5a19d80e4b27c3f1&scope=read_products&redirect_uri=https%3A%2F%2Fapi.stores.bestfulfill.tech%2Fsso%2Fsso%2Fbestcheckout%2Fshopify%2Fcallback&state=bc_harbor_expired1' },
      { id: 'bc_install_lavender', storeId: 'shop_lavender', shop: 'lavender-labs.myshopify.com', status: 'connected', submittedAt: 'Jun 18, 2026', linkSentAt: 'Jun 18, 2026', expiresAt: 'Jun 25, 2026', owner: 'Commerce ops', next: 'No action required', clientId: '1a2b3c4d5e6f708192a3b4c5d6e7f809', clientSecret: '9f8e7d6c5b4a39281706f5e4d3c2b1a0', clientSecretSaved: true, installLink: 'https://lavender-labs.myshopify.com/admin/oauth/authorize?client_id=1a2b3c4d5e6f708192a3b4c5d6e7f809&scope=read_products&redirect_uri=https%3A%2F%2Fapi.stores.bestfulfill.tech%2Fsso%2Fsso%2Fbestcheckout%2Fshopify%2Fcallback&state=bc_lavender_connected1' },
      { id: 'bc_install_folast', storeId: 'shop_folast', shop: 'folast-studio.myshopify.com', status: 'connected', submittedAt: 'Jul 02, 2026', linkSentAt: 'Jul 02, 2026', expiresAt: 'Jul 09, 2026', owner: 'Commerce ops', next: 'Resolve variant mapping', clientId: '2b3c4d5e6f708192a3b4c5d6e7f8091a', clientSecret: '8e7d6c5b4a39281706f5e4d3c2b1a09f', clientSecretSaved: true, installLink: 'https://folast-studio.myshopify.com/admin/oauth/authorize?client_id=2b3c4d5e6f708192a3b4c5d6e7f8091a&scope=read_products&redirect_uri=https%3A%2F%2Fapi.stores.bestfulfill.tech%2Fsso%2Fsso%2Fbestcheckout%2Fshopify%2Fcallback&state=bc_folast_connected1' },
      { id: 'bc_install_heyjune', storeId: 'shop_heyjune', shop: 'hey-june.myshopify.com', status: 'connected', submittedAt: 'Jul 08, 2026', linkSentAt: 'Jul 08, 2026', expiresAt: 'Jul 15, 2026', owner: 'Commerce ops', next: 'Replay order writeback', clientId: '3c4d5e6f708192a3b4c5d6e7f8091a2b', clientSecret: '7d6c5b4a39281706f5e4d3c2b1a09f8e', clientSecretSaved: true, installLink: 'https://hey-june.myshopify.com/admin/oauth/authorize?client_id=3c4d5e6f708192a3b4c5d6e7f8091a2b&scope=read_products&redirect_uri=https%3A%2F%2Fapi.stores.bestfulfill.tech%2Fsso%2Fsso%2Fbestcheckout%2Fshopify%2Fcallback&state=bc_heyjune_connected1' },
      { id: 'bc_install_coral', storeId: 'shop_coral', shop: 'coral-goods.myshopify.com', status: 'connected', submittedAt: 'Sep 5, 2026', linkSentAt: 'Sep 5, 2026', expiresAt: 'Sep 12, 2026', owner: 'Commerce ops', next: 'Finish domain verification', clientId: '4d5e6f708192a3b4c5d6e7f8091a2b3c', clientSecret: '6c5b4a39281706f5e4d3c2b1a09f8e7d', clientSecretSaved: true, installLink: 'https://coral-goods.myshopify.com/admin/oauth/authorize?client_id=4d5e6f708192a3b4c5d6e7f8091a2b3c&scope=read_products&redirect_uri=https%3A%2F%2Fapi.stores.bestfulfill.tech%2Fsso%2Fsso%2Fbestcheckout%2Fshopify%2Fcallback&state=bc_coral_connected1' },
      { id: 'bc_install_river', storeId: 'shop_river', shop: 'river-remedy.myshopify.com', status: 'reauth', submittedAt: 'Jul 15, 2026', linkSentAt: 'Jul 15, 2026', expiresAt: 'Jul 22, 2026', owner: 'Commerce ops', next: 'Request Shopify reconnection', clientId: '5e6f708192a3b4c5d6e7f8091a2b3c4d', clientSecret: '5b4a39281706f5e4d3c2b1a09f8e7d6c', clientSecretSaved: true, installLink: 'https://river-remedy.myshopify.com/admin/oauth/authorize?client_id=5e6f708192a3b4c5d6e7f8091a2b3c4d&scope=read_products&redirect_uri=https%3A%2F%2Fapi.stores.bestfulfill.tech%2Fsso%2Fsso%2Fbestcheckout%2Fshopify%2Fcallback&state=bc_river_reauth1' }
    ],
    routes: [
      { id: 'bc_route_lavender', storeId: 'shop_lavender', surface: 'BestCheckout Hosted Checkout', control: 'Shopify native 15%', snapshot: 'Sleep Reset · deployment v24', gate: 'Passed', safety: 'Ready', updated: 'Jul 29, 10:03' },
      { id: 'bc_route_folast', storeId: 'shop_folast', surface: 'BestCheckout Hosted Checkout', control: 'Shopify native 20%', snapshot: 'Seasonal bundle · deployment v11', gate: 'Review', safety: 'Ready', updated: 'Jul 29, 09:48' },
      { id: 'bc_route_heyjune', storeId: 'shop_heyjune', surface: 'BestCheckout Hosted Checkout', control: 'Shopify native 10%', snapshot: 'Refill recovery · deployment v7', gate: 'Passed', safety: 'Ready', updated: 'Jul 29, 09:57' },
      { id: 'bc_route_river', storeId: 'shop_river', surface: 'Shopify native only', control: 'Fallback before payment', snapshot: 'No active deployment', gate: 'Blocked', safety: 'Active', updated: 'Jul 29, 09:31' }
    ],
    writebacks: [
      { id: 'bc_wb_10482', storeId: 'shop_heyjune', reference: 'BC-10482', target: 'Shopify order #7821', idempotency: 'Preserved', state: 'Retryable', age: '7 min', detail: 'Shopify accepted the key; projection acknowledgement timed out.' },
      { id: 'bc_wb_10479', storeId: 'shop_lavender', reference: 'BC-10479', target: 'Shopify order #7718', idempotency: 'Verified', state: 'Completed', age: '2 min', detail: 'Final order snapshot projected successfully.' },
      { id: 'bc_wb_10475', storeId: 'shop_folast', reference: 'BC-10475', target: 'Shopify order #3184', idempotency: 'Verified', state: 'Completed', age: '18 min', detail: 'Offer acceptance and order update reconciled.' }
    ],
    events: [
      { id: 'bc_evt_9012', storeId: 'shop_folast', kind: 'products/update', subject: 'Webhook wh_9012', status: 'Retryable', attempts: 5, age: '11 min', detail: 'Retry budget reached after repeated 429 responses. Payload is retained for idempotent replay.', action: 'Queue replay' },
      { id: 'bc_evt_4812', storeId: 'shop_folast', kind: 'Catalog mapping', subject: 'Variant 4812', status: 'Action required', attempts: 3, age: '18 min', detail: 'A published offer references a replaced Shopify variant. Merchant configuration remains unchanged until revalidated.', action: 'Open Store' },
      { id: 'bc_evt_auth', storeId: 'shop_river', kind: 'Authorization', subject: 'Shopify access', status: 'Merchant action', attempts: 0, age: '35 min', detail: 'Authorization was revoked. New checkout traffic remains on Shopify native control.', action: 'Create reconnection task' }
    ],
    support: [
      { id: 'bc_case_river', storeId: 'shop_river', priority: 'High', subject: 'Shopify reconnection required', owner: 'Merchant success', state: 'Waiting for merchant', next: 'Send guided reconnection task' },
      { id: 'bc_case_folast', storeId: 'shop_folast', priority: 'Medium', subject: 'Variant mapping review', owner: 'Commerce ops', state: 'In progress', next: 'Coordinate replacement mapping' },
      { id: 'bc_case_help', storeId: '', priority: 'Low', subject: 'Checkout domain article needs refresh', owner: 'Content', state: 'Open', next: 'Open Content Center' }
    ],
    upgrades: [
      { storeId: 'shop_lavender', readiness: 'Eligible', continuity: 'Identity · connection · orders · analytics ready', next: 'Merchant-led upgrade conversation' },
      { storeId: 'shop_folast', readiness: 'Resolve first', continuity: 'Connection and assets retained; catalog mapping needs review', next: 'Finish catalog remediation' },
      { storeId: 'shop_heyjune', readiness: 'Eligible', continuity: 'Identity · connection · pages · payments references ready', next: 'Merchant-led upgrade conversation' }
    ]
  };

  return { menuSchema, menuTree, rolePermissionTree, expectedStoreAdminSidebar, accounts, categories,
    attribution: { domains, domainMatchPriority, utmFields }, bestcheckoutOps, platformCenter, bestcheckoutControl };
})();
