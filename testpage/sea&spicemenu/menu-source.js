/* ============================================================================
   Sea & Spice — MENU SOURCE (the ArmLoop link)
   ----------------------------------------------------------------------------
   This is the ONLY place the app gets its menu from. app.html never touches
   menu-data.js directly — it calls MenuSource.load(), which returns a Promise.

   Static:  menu-data.js (curated snapshot)          -> app
   Live:    ArmLoop POS API -> mapPlu() -> overlay() -> app

   HOW THE LIVE LINK WORKS
   The app's menu is curated: hand-picked ids, local images, its own category
   order and a hand-built package wizard. We do NOT throw that away and rebuild
   from the raw API. Instead the live feed is laid OVER the snapshot:

       snapshot supplies  ->  ids, images, names, layout, wizard structure
       ArmLoop supplies   ->  pluId, price, half price, availability

   That keeps the UI intact while making POS the single source of truth for
   anything that affects money. Per the integration doc, price is submitted
   unmodified and is never recalculated client-side.

   Verified against the live test server 2026-09-05: 12 categories, 178 items.

   CONTRACT — MenuSource.load() resolves to:
     { currency, table, potFee, condiment{cn,en,price,plu}, fish[], broths[],
       addons[], addonCats[], packages[] }
   Item shape: { id, cn, en, price, img, plu, avail?, cat?, hot?, desc?, note?,
                 tag?, half?, halfPrice? }
     cn = Chinese name   en = English name   plu = ArmLoop pluId
     halfPrice = POS half-portion price; when absent the app falls back to its
                 own 60% rule, which POS does NOT agree with — see §半份 below.
   ============================================================================ */

(function () {
  'use strict';

  // --- flip this to go live -------------------------------------------------
  // false -> curated snapshot only (what the public demo ships with)
  // true  -> snapshot + live ArmLoop prices/pluIds/availability
  var USE_ARMLOOP = false;

  // --- ArmLoop connection ---------------------------------------------------
  var ARMLOOP = {
    baseUrl:     'https://proxy0.aclas.com.au/CTCOMM',  // test server; swap for prod
    // The X-API-KEY is NEVER hard-coded here — this file is served to browsers
    // and View Source would leak it. It is injected at runtime instead:
    //   window.ARMLOOP_KEY = '...'   (local testing only)
    // In production ArmLoop proxies these calls server-side and attaches the
    // header there; then baseUrl points at that proxy and no key is needed.
    apiKey:      '',
    menuGroupNo: '',   // server returns the full menu when this is empty (verified)
    imageServer: '',   // imageUrl values are relative ("/PIC/0116.jpg")
    lang:        'cn', // 'en' | 'cn' | 'tw'
    showType:    2,    // 0-all 1-kiosk 2-self-ordering 3-cashier 4-online
  };

  // Live category ids, read off the server 2026-09-05. Kept for reference and
  // used by assembleRaw(); the overlay path matches on pluId and doesn't need them.
  var CAT = {
    condiment: '09',   // 调料/位          -> 0105 $3.50
    packages:  'A',    // 套餐             -> A01..A04, all subMenu:1
    pkgParts:  'A9',   // 套餐内容          -> $0 option items, submenu use only
    broths:    '01',   // 香海鱼火锅(先选锅底后选鱼）
    fish:      '10',   // 加鱼
    meat:      '03',   // 荤菜
    veg:       '04',   // 素菜
    snacks:    '05',   // 小吃
    drinks:    '07',   // 饮料
    alcohol:   '06',   // 酒
    other:     '11',   // 其他             -> 1101 菌菇, 1102 番茄
    fishInfo:  '998',  // 鱼种介绍          -> display duplicates of cat 10
  };

  var STORE_KEY = 'seaspice_menu';   // admin overlay written by menu-admin.html
  var AVAIL_KEY = 'seaspice_avail';  // last-known availability, per §5 of the plan
  var AVAIL_MAX_AGE = 15 * 60 * 1000;   // beyond this, stop trusting the cache

  /* --------------------------------------------------------------------------
     AVAILABILITY CACHE
     The snapshot has everything available, so falling back to it on a network
     blip would put sold-out items back on sale. Remember what POS last told us
     and keep using that instead. Fail open while browsing, closed at checkout.
     -------------------------------------------------------------------------- */
  function eachItem(menu, fn) {
    ['fish', 'broths', 'addons', 'packages'].forEach(function (k) {
      if (Array.isArray(menu[k])) menu[k].forEach(fn);
    });
    if (menu.condiment) fn(menu.condiment);
  }

  function saveAvail(menu) {
    try {
      var a = {};
      eachItem(menu, function (it) { if (it.plu) a[String(it.plu)] = it.avail === false ? 0 : 1; });
      localStorage.setItem(AVAIL_KEY, JSON.stringify({ t: Date.now(), a: a }));
    } catch (e) { /* private mode / quota — the app still works, just without memory */ }
  }

  function readAvail() {
    try {
      var c = JSON.parse(localStorage.getItem(AVAIL_KEY));
      if (c && c.a && typeof c.t === 'number') return c;
    } catch (e) { /* corrupt -> treat as absent */ }
    return null;
  }

  // Used when the live fetch fails. Never widens availability — it can only take
  // items off sale, so a stale cache cannot resurrect something POS retired.
  function applyCachedAvail(menu) {
    var c = readAvail();
    if (!c) {
      eachItem(menu, function (it) { if (!it.plu) it.avail = false; });
      menu._availAge = null; menu._availStale = true; return menu;
    }
    eachItem(menu, function (it) {
      // No pluId means POS cannot receive it — unorderable regardless of cache.
      if (!it.plu) { it.avail = false; return; }
      if (c.a[String(it.plu)] === 0) it.avail = false;
    });
    menu._availAge = Date.now() - c.t;
    menu._availStale = menu._availAge > AVAIL_MAX_AGE;
    return menu;
  }

  /* ==========================================================================
     STATIC SOURCE (curated) — the localStorage overlay from menu-admin.html
     wins over menu-data.js so edits made in the editor show up live.
     ========================================================================== */
  function resolveSync() {
    try {
      var o = JSON.parse(localStorage.getItem(STORE_KEY));
      if (o && o.addons && o.addonCats && o.packages) return o;
    } catch (e) { /* corrupt overlay -> fall through to the deployed snapshot */ }
    return window.SEASPICE;
  }

  /* ==========================================================================
     NAME MATCHING
     ArmLoop's export mixes CJK radical/compatibility glyphs into product names
     (⻥ for 鱼, ⽜ for 牛, ⼈ for 人 …) and writes "超值4人套餐" where the app says
     "超值四人套餐". Fold both sides before comparing or nothing matches.
     ========================================================================== */
  var FOLD = { '⻥':'鱼','⽜':'牛','⾁':'肉','⼈':'人','⾖':'豆','⽩':'白','⼤':'大',
               '⾦':'金','⼟':'土','⽟':'玉','⽺':'羊','⼿':'手','⼴':'广','⾎':'血',
               '⽶':'米','⽅':'方','⻘':'青','⽣':'生','⽔':'水','⽕':'火','⼩':'小',
               '⽪':'皮','⾹':'香','⼲':'干','⻄':'西','⾯':'面','⻓':'长','⻔':'门',
               '⻛':'风','⻋':'车','⻉':'贝','⻅':'见','⼦':'子' };
  var DIGIT = { '一':'1','二':'2','两':'2','三':'3','四':'4','五':'5','六':'6',
                '七':'7','八':'8','九':'9','十':'10' };

  function norm(s) {
    return String(s || '').toLowerCase()
      .replace(/[⺀-⿟︰-﹏]/g, function (c) { return FOLD[c] || c; })
      .split('').map(function (c) { return DIGIT[c] || c; }).join('')
      .replace(/[\s（）()·・,，.。\/\-—]/g, '')
      .replace(/330ml|每份|一份/g, '');
  }

  /* ==========================================================================
     ARMLOOP MAPPING — their Plu object -> our item shape.
     pluName1 is the primary/default-language name, pluName2 the secondary.
     ========================================================================== */
  function mapPlu(p) {
    return {
      id:    p.pluId,
      plu:   p.pluId,
      en:    p.pluName1 || '',
      cn:    p.pluName2 || '',
      desc:  p.description || '',
      price: pickPrice(p),
      halfPrice: halfOf(p),
      img:   p.imageUrl ? ARMLOOP.imageServer + p.imageUrl : '',
      avail: p.available !== 0,
      cat:   p.catName || '',
      hot:   p.popular === 1 || undefined,
      tag:   p.featured === 1 ? '店长推荐' : (p.special === 1 ? '特价' : ''),
      // carried through so the order builder can honour ArmLoop's rules:
      _multiPrice: p.multiPrice,   // 1 -> priceList carries the real prices
      _priceList:  p.priceList,    // only entries with price!=0 or subName!='' are real
      _subMenu:    p.subMenu,      // 1 -> /shop/plu/submenu/v1 for option groups
      _spicy:      p.spicy,
    };
  }

  // Base price. multiPrice items keep their real prices in priceList; entry 0
  // is the full portion. Never recalculated client-side.
  function pickPrice(p) {
    if (p.multiPrice === 1 && Array.isArray(p.priceList)) {
      var real = p.priceList.filter(function (x) {
        return x.price !== 0 || (x.subName && x.subName !== '');
      });
      if (real.length) return real[0].price;
    }
    return p.price;
  }

  // 半份 — POS carries the half price as the priceList entry whose subName is
  // "半份（Half）". It is NOT 60% of the full price: POS says 秘制鱼丸 half is
  // $9.50 where the app's rule computes $11.28. Where POS gives us a number we
  // use it; where it doesn't, the app falls back to its own rule and the price
  // is unverified (28 vegetable items are in that state — see the sync report).
  function halfOf(p) {
    if (!Array.isArray(p.priceList)) return undefined;
    var h = p.priceList.find(function (x) { return x.subName && /半份|half/i.test(x.subName); });
    return h ? h.price : undefined;
  }

  /* ========================================================================== */
  function api(path, body) {
    var headers = { 'Content-Type': 'application/json' };
    var key = ARMLOOP.apiKey || (typeof window !== 'undefined' && window.ARMLOOP_KEY);
    if (key) headers['X-API-KEY'] = key;   // omitted when a server-side proxy adds it
    return fetch(ARMLOOP.baseUrl + path, {
      method: 'POST', headers: headers, body: JSON.stringify(body),
    }).then(function (r) { return r.json(); }).then(function (j) {
      // NOTE: ArmLoop reports success in `code`, not reliably in the HTTP status.
      if (!j || j.code !== 200) throw new Error('ArmLoop ' + path + ': ' + (j && (j.message || j.code)));
      return j.data;
    });
  }

  // Menu = categories, then the items of each category.
  function fetchArmLoop() {
    return api('/api/open/v1/shop/categories', {
      lang: ARMLOOP.lang, menuGroupNo: ARMLOOP.menuGroupNo,
      showType: ARMLOOP.showType, catType: 3,
    }).then(function (cats) {
      return Promise.all(cats.map(function (c) {
        return api('/api/open/v1/shop/category/plus', {
          // The docs say pageSize -1 means "no paging", but -1 makes the server
          // return code:null with no data. 10000 works. Verified 2026-08-20.
          catId: c.catId, lang: ARMLOOP.lang, page: 1, pageSize: 10000,
          pluType: 0, showType: ARMLOOP.showType,
          virtualCategory: c.beingVirtual === 1 ? 1 : 0,
        }).then(function (d) {
          return { cat: c, items: (d.dataList || []).map(mapPlu) };
        });
      }));
    });
  }

  // Option groups for a subMenu:1 item (the four set packages).
  // Group shape: { pluId, pluName1, single, must, min, max, attrs[] }
  //   single 1 = pick one · must 1 = required · min/max = how many
  // A01 has 9 groups, A02 6, A03/A04 1. attrs are ordinary PLUs, so the order
  // builder can reference their pluIds directly.
  function fetchSubmenu(pluId) {
    return api('/api/open/v1/shop/plu/submenu/v1',
      { pluId: pluId, lang: ARMLOOP.lang, showType: ARMLOOP.showType })
      .then(function (groups) { return groups || []; });
  }

  /* ==========================================================================
     OVERLAY — live POS data laid over the curated snapshot.
     Money fields come from ArmLoop; everything else stays as curated.
     ========================================================================== */
  function overlay(snapshot, groups) {
    var menu = JSON.parse(JSON.stringify(snapshot));   // never mutate the source
    var byPlu = {}, byName = {};
    groups.forEach(function (g) {
      g.items.forEach(function (it) {
        byPlu[String(it.plu)] = it;
        [it.cn, it.en].forEach(function (n) {
          if (n) (byName[norm(n)] = byName[norm(n)] || []).push(it);
        });
      });
    });

    var report = { priced: 0, linked: 0, missing: [], noHalf: [] };

    function bind(item) {
      var live = item.plu ? byPlu[String(item.plu)] : null;
      if (!live) {                                   // no pluId yet — match by name
        var hit = byName[norm(item.cn)] || byName[norm(item.en)];
        if (hit && hit.length) { live = hit[0]; item.plu = live.plu; report.linked++; }
      }
      // An item POS removed from this channel simply does not come back in the
      // feed. "Absent" therefore means UNAVAILABLE — not "leave unchanged".
      // 18 items are channel-hidden today; without this they would stay on sale.
      if (!live) { report.missing.push(item.cn || item.en); item.avail = false; return item; }

      if (typeof live.price === 'number') { item.price = live.price; report.priced++; }
      if (typeof live.halfPrice === 'number') item.halfPrice = live.halfPrice;
      else if (item.half) report.noHalf.push(item.cn || item.en);
      if (live.avail === false) item.avail = false;
      item._multiPrice = live._multiPrice;
      item._priceList  = live._priceList;
      item._subMenu    = live._subMenu;
      return item;
    }

    ['fish', 'broths', 'addons', 'packages'].forEach(function (k) {
      if (Array.isArray(menu[k])) menu[k] = menu[k].map(bind);
    });
    if (menu.condiment) bind(menu.condiment);

    // Package options carry no pluId of their own — they name an ordinary item.
    // Resolve each by name and stamp availability, then take the whole package
    // off sale if any required group has nothing left to pick.
    (menu.packages || []).forEach(function (pkg) {
      if (!Array.isArray(pkg.groups)) return;
      pkg.groups.forEach(function (g) {
        var live = 0;
        (g.opts || []).forEach(function (opt) {
          var hit = byName[norm(opt.n)] || byName[norm(opt.en)];
          opt.avail = !(hit && hit.length && hit[0].avail === false);
          if (opt.avail) live++;
        });
        g._liveOpts = live;
        // A group blocks the set only when NOTHING in it is available. Do not
        // compare against g.pick: the wizard lets a multi-pick group take the
        // same option more than once (甜品 is 3 options, pick 4), so one live
        // option is enough to satisfy any group.
        if (live === 0) pkg.avail = false;
      });
    });

    menu._live = report;
    return menu;
  }

  // Attach live option groups to the four set packages so the wizard can read
  // ArmLoop's own single/must/min/max rules instead of the hardcoded ones.
  function attachPackageGroups(menu) {
    var sets = (menu.packages || []).filter(function (p) { return p.plu && p._subMenu === 1; });
    if (!sets.length) return Promise.resolve(menu);
    return Promise.all(sets.map(function (p) {
      return fetchSubmenu(p.plu).then(function (gs) { p.liveGroups = gs; })
        .catch(function () { p.liveGroups = null; });   // keep the hardcoded wizard
    })).then(function () { return menu; });
  }

  /* ==========================================================================
     RAW ASSEMBLY — build the menu purely from ArmLoop, no snapshot.
     Not the default: it drops the curated images, category order and wizard.
     Kept because ArmLoop will want it once they host and curate from POS.
     ========================================================================== */
  function assembleRaw(groups) {
    var byCat = {};
    groups.forEach(function (g) { byCat[g.cat.catId] = g.items; });
    var pick = function (id) { return byCat[id] || []; };
    var condiment = pick(CAT.condiment)[0];
    var SKIP = [CAT.condiment, CAT.packages, CAT.pkgParts, CAT.fishInfo, CAT.broths];

    return {
      currency:  'AUD',
      table:     '01',                       // dine-in table; orderType 2
      potFee:    30,                         // no pluId in POS yet
      condiment: condiment || { cn: '调料（每位）', en: 'Condiments per Person', price: 3.5 },
      fish:      pick(CAT.fish).filter(function (p) { return Number(p.price) >= 50; }),
      broths:    pick(CAT.broths).concat(pick(CAT.other)),
      packages:  pick(CAT.packages),
      addons:    groups.filter(function (g) { return SKIP.indexOf(g.cat.catId) < 0; })
                       .reduce(function (a, g) { return a.concat(g.items); }, []),
      addonCats: groups.filter(function (g) { return SKIP.indexOf(g.cat.catId) < 0; })
                       .map(function (g) { return g.cat.catName2 || g.cat.catName1; }),
    };
  }

  /* ========================================================================== */
  window.MenuSource = {
    // Synchronous best-effort, used for the app's initial binding so the UI can
    // paint immediately. Always returns the static snapshot.
    resolveSync: resolveSync,

    // The real entry point. app.html renders from whatever this resolves to.
    // If ArmLoop is unreachable we fall back to the snapshot rather than
    // showing an empty menu — keep that behaviour.
    load: function () {
      if (!USE_ARMLOOP) return Promise.resolve(resolveSync());
      var snapshot = resolveSync();
      return fetchArmLoop()
        .then(function (groups) { return overlay(snapshot, groups); })
        .then(attachPackageGroups)
        .then(function (menu) {
          var r = menu._live || {};
          console.info('[MenuSource] ArmLoop live: ' + r.priced + ' prices, ' +
                       r.linked + ' newly linked, ' + (r.missing || []).length + ' unavailable');
          saveAvail(menu);
          menu._availAge = 0; menu._availStale = false;
          return menu;
        })
        .catch(function (err) {
          // Fall back to the snapshot for names and prices, but carry the last
          // known availability across so nothing sold-out comes back on sale.
          console.error('[MenuSource] ArmLoop fetch failed, using cached availability:', err);
          return applyCachedAvail(JSON.parse(JSON.stringify(snapshot)));
        });
    },

    // exposed for testing and for the order builder
    _mapPlu:      mapPlu,
    _overlay:     overlay,
    _assembleRaw: assembleRaw,
    _fetchMenu:   fetchArmLoop,
    _fetchSubmenu: fetchSubmenu,
    _norm:        norm,
    // is the live ArmLoop link on? the app skips refreshes when it isn't
    live:         function () { return USE_ARMLOOP; },
    // availability cache — the app reads these to decide what to do at checkout
    availAge:     function () { var c = readAvail(); return c ? Date.now() - c.t : null; },
    availStale:   function () { var a = this.availAge(); return a === null || a > AVAIL_MAX_AGE; },
    _saveAvail:   saveAvail,
    _applyCachedAvail: applyCachedAvail,
    _config:      ARMLOOP,
    _cats:        CAT,
  };
})();
