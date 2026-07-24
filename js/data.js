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

  // ---- BestCheckout operations: platform-owned connection, sync and reconciliation control plane ----
  const bestcheckoutOps = {
    stores: [
      { id: 'shop_lavender', store: 'Lavender Labs', domain: 'lavender-labs.myshopify.com', shopId: 'bs_store_8f42', install: 'Connected', data: 'Healthy', lastSuccess: '2 min ago', lastAttempt: '2 min ago', funnels: '3 live', payment: '2 routes', writeback: 'Healthy', health: 'Healthy', next: 'No action required', bestshopio: {
        storeName: 'Lavender Labs Store', merchant: 'Avery Wells', merchantId: 'mer_1042', provisionStatus: 'Completed', storeStatus: 'Active', defaultDomain: 'lavender-labs.stores.bestshopio.com', customDomain: 'lavenderlabs.com', ssl: 'Active', region: 'US', routingVersion: 'v1', createdAt: 'Jun 18, 2026', taskUpdated: 'Jun 18, 2026 09:42'
      }, readiness: {
        authorization: { status: 'Connected', value: 'OAuth + Admin API', scopes: 'Products · orders · customers', checked: '2 min ago' },
        sync: { status: 'Healthy', value: '5 data entities · 5 webhook topics', detail: '5 / 5 delivery checks healthy', checked: '2 min ago' },
        domain: { status: 'Verified', value: 'checkout.lavenderlabs.com', host: 'checkout', target: 'edge.bestcheckout.app', ssl: 'Active', checked: '2 min ago' },
        paymentConfig: { status: 'Configured', value: 'Stripe · live mode', methods: 'Cards · Apple Pay · Google Pay', detail: '3 / 3 payment webhooks healthy', checked: '1 min ago' },
        embed: { status: 'Enabled', value: 'Dawn', detail: 'Cart checkout · Buy it now · Cart drawer', checked: '1 min ago' }
      } },
      { id: 'shop_folast', store: 'Folast Studio', domain: 'folast-studio.myshopify.com', shopId: 'bs_store_c901', install: 'Connected', data: 'Review', lastSuccess: '18 min ago', lastAttempt: '11 min ago · webhook retry pending', funnels: '2 live', payment: '1 route', writeback: 'Healthy', health: 'Review', next: 'Resolve 2 variant mappings', bestshopio: {
        storeName: 'Folast Studio Store', merchant: 'Mia Chen', merchantId: 'mer_1096', provisionStatus: 'Completed', storeStatus: 'Active', defaultDomain: 'folast-studio.stores.bestshopio.com', customDomain: 'folaststudio.com', ssl: 'Active', region: 'US', routingVersion: 'v1', createdAt: 'Jul 02, 2026', taskUpdated: 'Jul 02, 2026 14:18'
      }, readiness: {
        authorization: { status: 'Connected', value: 'OAuth + Admin API', scopes: 'Products · orders · customers', checked: '11 min ago' },
        sync: { status: 'Review', value: '5 data entities · 5 webhook topics', detail: 'Webhook retry is pending', checked: '11 min ago' },
        domain: { status: 'Verified', value: 'checkout.folast-studio.com', host: 'checkout', target: 'edge.bestcheckout.app', ssl: 'Active', checked: '18 min ago' },
        paymentConfig: { status: 'Configured', value: 'Airwallex · live mode', methods: 'Cards · Apple Pay', detail: '1 / 1 payment webhooks healthy', checked: '8 min ago' },
        embed: { status: 'Not detected', value: 'Shrine PRO', detail: 'Theme changed; App Embed is not on the live theme', checked: '17 min ago' }
      } },
      { id: 'shop_heyjune', store: 'Hey June', domain: 'hey-june.myshopify.com', shopId: 'bs_store_a715', install: 'Connected', data: 'Healthy', lastSuccess: '5 min ago', lastAttempt: '5 min ago', funnels: '1 live', payment: '1 route', writeback: 'Review', health: 'Review', next: 'Replay 1 order writeback', bestshopio: {
        storeName: 'Hey June Store', merchant: 'June Park', merchantId: 'mer_1120', provisionStatus: 'Completed', storeStatus: 'Active', defaultDomain: 'hey-june.stores.bestshopio.com', customDomain: 'Not connected', ssl: 'Not configured', region: 'US', routingVersion: 'v1', createdAt: 'Jul 08, 2026', taskUpdated: 'Jul 08, 2026 11:06'
      }, readiness: {
        authorization: { status: 'Connected', value: 'OAuth + Admin API', scopes: 'Products · orders · customers', checked: '5 min ago' },
        sync: { status: 'Healthy', value: '5 data entities · 5 webhook topics', detail: '5 / 5 delivery checks healthy', checked: '5 min ago' },
        domain: { status: 'Verified', value: 'checkout.heyjune.co', host: 'checkout', target: 'edge.bestcheckout.app', ssl: 'Active', checked: '5 min ago' },
        paymentConfig: { status: 'Configured', value: 'Stripe · live mode', methods: 'Cards · Link', detail: '2 / 2 payment webhooks healthy', checked: '4 min ago' },
        embed: { status: 'Enabled', value: 'Sense', detail: 'Cart checkout · Buy it now · Cart drawer', checked: '5 min ago' }
      } },
      { id: 'shop_river', store: 'River Remedy', domain: 'river-remedy.myshopify.com', shopId: 'bs_store_d212', install: 'Reauthorization needed', data: 'Paused', lastSuccess: 'Yesterday', lastAttempt: '35 min ago · blocked by authorization', funnels: '0 live', payment: '0 routes', writeback: 'Paused', health: 'Action required', next: 'Ask merchant to reconnect Shopify', bestshopio: {
        storeName: 'River Remedy Store', merchant: 'Riley Morgan', merchantId: 'mer_1178', provisionStatus: 'Failed', storeStatus: 'Disabled', defaultDomain: 'river-remedy.stores.bestshopio.com', customDomain: 'riverremedy.com', ssl: 'Pending', region: 'US', routingVersion: 'v1', createdAt: 'Jul 15, 2026', taskUpdated: 'Today 08:55'
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

  return { menuSchema, menuTree, rolePermissionTree, expectedStoreAdminSidebar, accounts, categories,
    attribution: { domains, channelRules, clickIds, channelPriority, model, session, versions }, bestcheckoutOps };
})();
