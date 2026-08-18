/* ============================================================================
   Sea & Spice — MENU SOURCE (the ArmLoop swap point)
   ----------------------------------------------------------------------------
   This is the ONLY place the app gets its menu from. app.html never touches
   menu-data.js directly. To go live on ArmLoop POS you implement ONE function
   in this file — fetchArmLoop() — and change USE_ARMLOOP to true. Nothing in
   app.html needs to change.

   Today:  menu-data.js (static snapshot)  ->  app
   Live:   ArmLoop POS API                 ->  mapPlu()  ->  app

   CONTRACT — MenuSource.load() resolves to an object of this shape:
     { currency, table, potFee, condiment{cn,en,price},
       fish[], broths[], addons[], addonCats[], packages[] }
   Item shape: { id, cn, en, price, img, plu, avail?, cat?, hot?, desc?, note?, tag? }
     cn   = Chinese name        en  = English name
     plu  = ArmLoop pluId       avail:false hides the item from customers
   ============================================================================ */

(function () {
  'use strict';

  // --- flip this to go live -------------------------------------------------
  var USE_ARMLOOP = false;

  // --- ArmLoop connection ---------------------------------------------------
  // Values marked REQUIRED are supplied by ArmLoop ("API提供方给出的數據" in the
  // integration PDF). Do NOT put apiKey here if this file is served to browsers
  // — proxy the calls server-side so the key is never in client JS.
  var ARMLOOP = {
    baseUrl:     'https://proxy0.aclas.com.au/CTCOMM', // test server; swap for prod
    apiKey:      '',   // REQUIRED — sent as the X-API-KEY header
    menuGroupNo: '',   // REQUIRED — 菜單編碼
    imageServer: '',   // REQUIRED — imageUrl values are relative ("/PIC/1001.jpg")
    lang:        'en', // 'en' | 'cn' | 'tw'
    showType:    2,    // 0-all 1-kiosk 2-self-ordering 3-cashier 4-online
  };

  var STORE_KEY = 'seaspice_menu';   // admin overlay written by menu-admin.html

  /* ==========================================================================
     STATIC SOURCE (mockup) — localStorage overlay wins over menu-data.js so
     edits made in menu-admin.html show up live.
     ========================================================================== */
  function resolveSync() {
    try {
      var o = JSON.parse(localStorage.getItem(STORE_KEY));
      if (o && o.addons && o.addonCats && o.packages) return o;
    } catch (e) { /* corrupt overlay -> fall through to the deployed snapshot */ }
    return window.SEASPICE;
  }

  /* ==========================================================================
     ARMLOOP MAPPING
     Their Plu object -> our item shape. Per the integration doc, pluName1 is the
     default/primary-language name and pluName2 the secondary (their sample:
     pluName1 "Purple1" / pluName2 "紫色"), so pluName1->en and pluName2->cn.
     ========================================================================== */
  function mapPlu(p) {
    return {
      id:    p.pluId,
      plu:   p.pluId,
      en:    p.pluName1 || '',
      cn:    p.pluName2 || '',
      desc:  p.description || '',
      price: pickPrice(p),
      img:   p.imageUrl ? ARMLOOP.imageServer + p.imageUrl : '',
      avail: p.available !== 0,
      cat:   p.catName || '',
      hot:   p.popular === 1 || undefined,
      tag:   p.featured === 1 ? '店长推荐' : (p.special === 1 ? '特价' : ''),
      // carried through so the order builder can honour ArmLoop's rules:
      _multiPrice: p.multiPrice,   // 1 -> customer must pick one of priceList
      _priceList:  p.priceList,    // only entries with price!=0 or subName!='' are real
      _subMenu:    p.subMenu,      // 1 -> must call /shop/plu/submenu/v1 for toppings
      _spicy:      p.spicy,
    };
  }

  // multiPrice items: the doc says filter to entries where price != 0 OR
  // subName != '', and that the CHOSEN index must be submitted as priceIndex.
  // Price is never recalculated client-side — the doc states it twice.
  function pickPrice(p) {
    if (p.multiPrice === 1 && Array.isArray(p.priceList)) {
      var real = p.priceList.filter(function (x) {
        return x.price !== 0 || (x.subName && x.subName !== '');
      });
      if (real.length) return real[0].price;
    }
    return p.price;
  }

  function api(path, body) {
    return fetch(ARMLOOP.baseUrl + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-KEY': ARMLOOP.apiKey },
      body: JSON.stringify(body),
    }).then(function (r) { return r.json(); }).then(function (j) {
      // NOTE: ArmLoop returns 200 in `code`, not necessarily in the HTTP status.
      if (!j || j.code !== 200) throw new Error('ArmLoop ' + path + ': ' + (j && j.message));
      return j.data;
    });
  }

  /* --------------------------------------------------------------------------
     ARMLOOP: IMPLEMENT THIS.
     Per the integration doc the menu is two calls:
       1. POST /api/open/v1/shop/categories
          { lang, menuGroupNo, showType, catType: 3 }
       2. POST /api/open/v1/shop/category/plus   (once per category)
          { catId, lang, page: 1, pageSize: -1, pluType: 0, showType,
            virtualCategory }   <- virtualCategory = 1 when the category's
                                   beingVirtual is 1, else 0
     Items with subMenu === 1 additionally need
       POST /api/open/v1/shop/plu/submenu/v1  { pluId, lang, showType }
     to load their topping groups (single / must / min / max).

     The blank returns below are the decisions only ArmLoop can make — see
     ARMLOOP-HANDOVER.md for the list of items that currently have no pluId.
     -------------------------------------------------------------------------- */
  function fetchArmLoop() {
    return api('/api/open/v1/shop/categories', {
      lang: ARMLOOP.lang, menuGroupNo: ARMLOOP.menuGroupNo,
      showType: ARMLOOP.showType, catType: 3,
    }).then(function (cats) {
      return Promise.all(cats.map(function (c) {
        return api('/api/open/v1/shop/category/plus', {
          catId: c.catId, lang: ARMLOOP.lang, page: 1, pageSize: -1,
          pluType: 0, showType: ARMLOOP.showType,
          virtualCategory: c.beingVirtual === 1 ? 1 : 0,
        }).then(function (d) {
          return { cat: c, items: (d.dataList || []).map(mapPlu) };
        });
      })).then(function (groups) { return assemble(groups); });
    });
  }

  // Fold ArmLoop's flat categories into the shape the app expects.
  // Which catId feeds which section is a config decision — fill these in.
  function assemble(groups) {
    var byCat = {};
    groups.forEach(function (g) { byCat[g.cat.catId] = g.items; });
    var all = groups.reduce(function (a, g) { return a.concat(g.items); }, []);

    return {
      currency:  'AUD',
      table:     '01',                      // dine-in table; orderType 2
      potFee:    30,                        // TODO: needs a pluId in ArmLoop
      condiment: { cn: '调料（每位）', en: 'Condiments per Person', price: 3.5 }, // TODO: pluId
      fish:      byCat[/* TODO catId */ ''] || [],
      broths:    byCat[/* TODO catId */ ''] || [],
      packages:  byCat[/* TODO catId */ ''] || [],   // sets: expect subMenu===1
      addons:    all,
      addonCats: groups.map(function (g) { return g.cat.catName1; }),
    };
  }

  /* ========================================================================== */
  window.MenuSource = {
    // Synchronous best-effort, used for the app's initial binding so the UI can
    // paint immediately. Always returns the static snapshot.
    resolveSync: resolveSync,

    // The real entry point. app.html renders from whatever this resolves to.
    // If ArmLoop is unreachable we fall back to the snapshot rather than
    // showing an empty menu.
    load: function () {
      if (!USE_ARMLOOP) return Promise.resolve(resolveSync());
      return fetchArmLoop().catch(function (err) {
        console.error('[MenuSource] ArmLoop fetch failed, using static menu:', err);
        return resolveSync();
      });
    },

    // exposed for testing the mapping against a captured API response
    _mapPlu: mapPlu,
    _config: ARMLOOP,
  };
})();
