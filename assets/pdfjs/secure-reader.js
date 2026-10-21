/*
 * خواننده‌ی اختصاصی PDF (داخل خود سایت)
 * - صفحه‌ها را با PDF.js روی canvas می‌کشد؛ نمایشگر خودِ مرورگر (با دکمه‌ی دانلود/پرینت) اصلاً استفاده نمی‌شود.
 * - فقط صفحه‌های نزدیکِ دید رسم می‌شوند (کتاب ۶۰۰ صفحه‌ای هم سبک می‌ماند).
 * - آخرین صفحه‌ی مطالعه برای هر کتاب در همین مرورگر یادآوری می‌شود.
 * استفاده:  SecureReader.open({host, data: ArrayBuffer, title, bookId, lang, onClose, bookmarks?: [شماره‌ی صفحه‌ها], onBookmarks?: fn(arr)}) → {destroy()}
 * نشانک‌ها: در همین مرورگر ذخیره می‌شوند؛ برای همگام‌سازی بین دستگاه‌ها، onBookmarks را به سرور وصل کنید و فهرست ذخیره‌شده را به bookmarks بدهید.
 * نکته: بعد از هر تغییر این فایل، شماره‌ی ?v= را در app-index.js / app-author.js بالا ببر (کش یک‌ساله).
 */
(function () {
  'use strict';

  var BASE = (function () {
    var s = document.currentScript;
    if (s && s.src) return s.src.replace(/[^\/]*$/, '').replace(/\?.*$/, '');
    return new URL('assets/pdfjs/', document.baseURI).href;
  })();

  var pdfjsPromise = null;
  function loadPdfjs() {
    if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
    if (pdfjsPromise) return pdfjsPromise;
    pdfjsPromise = new Promise(function (ok, fail) {
      var s = document.createElement('script');
      s.src = BASE + 'pdf.js';
      s.onload = function () {
        if (!window.pdfjsLib) { pdfjsPromise = null; return fail(new Error('pdfjs missing')); }
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = BASE + 'pdf.worker.js';
        ok(window.pdfjsLib);
      };
      s.onerror = function () { pdfjsPromise = null; fail(new Error('pdfjs load failed')); };
      document.head.appendChild(s);
    });
    return pdfjsPromise;
  }

  var CSS = '' +
    '#readerModal .modal-window.sr-full{width:100vw!important;max-width:none!important;height:100vh!important;height:100dvh!important;max-height:none!important;border-radius:0!important;padding:0!important;border:0!important;display:flex!important;flex-direction:column;overflow:hidden!important}' +
    '#readerModal .modal-window.sr-full>h3,#readerModal .modal-window.sr-full>.btn-read{display:none!important}' +
    '#readerModal .modal-window.sr-full>#readerBodyText{flex:1;min-height:0;display:flex;flex-direction:column;margin:0;padding:0}' +
    '.sr-root{position:relative;flex:1;min-height:0;display:flex;flex-direction:column;background:#121317;color:#e9e9ee;font-family:inherit;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}' +
    '.sr-bar{position:relative;display:flex;align-items:center;gap:6px;padding:8px 10px;background:#1b1d22;border-bottom:1px solid #2a2d34;direction:ltr;flex-wrap:nowrap}' +
    '.sr-bar button{flex:none;display:flex;align-items:center;justify-content:center;background:transparent;color:#d7d9df;border:0;border-radius:10px;width:36px;height:36px;padding:0;cursor:pointer;font-family:inherit;transition:background .15s,transform .12s,color .15s}' +
    '.sr-bar button:hover{background:rgba(255,255,255,.09)}' +
    '.sr-bar button:active{transform:scale(.92)}' +
    '.sr-bar button:focus-visible,.sr-tab:focus-visible,.sr-mk:focus-visible,.sr-mkx:focus-visible{outline:2px solid #6ea8fe;outline-offset:2px}' +
    '.sr-bar svg,.sr-mkx svg{display:block;pointer-events:none}' +
    '.sr-bar .sr-star.on{color:#f5b82e;background:rgba(245,184,46,.14)}' +
    '.sr-bar .sr-star.on svg{fill:#f5b82e}' +
    '.sr-bar .sr-star.pop svg{animation:srpop .38s cubic-bezier(.3,1.6,.5,1)}' +
    '@keyframes srpop{0%{transform:scale(.6) rotate(-18deg)}60%{transform:scale(1.3) rotate(8deg)}100%{transform:scale(1) rotate(0)}}' +
    '.sr-title{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:14px;direction:rtl;text-align:right;color:#f2f2f6}' +
    '.sr-zoom{width:54px;height:28px;box-sizing:border-box;padding:0 2px;text-align:center;direction:ltr;font-size:12px;font-family:inherit;color:#9aa0ad;background:transparent;border:1px solid transparent;border-radius:8px;cursor:text}' +
    '.sr-zoom:hover{border-color:#343843}.sr-zoom:focus{outline:none;border-color:#6ea8fe;color:#fff;background:#121317}' +
    '.sr-pg{width:48px;height:32px;border-radius:8px;border:1px solid #343843;background:#121317;color:#fff;text-align:center;font-size:14px;font-family:inherit}' +
    '.sr-pg:focus{outline:none;border-color:#6ea8fe}' +
    '.sr-count{direction:ltr;unicode-bidi:isolate;font-size:13px;color:#9aa0ad;white-space:nowrap}' +
    '.sr-prog{position:absolute;left:0;right:0;bottom:-1px;height:2px;background:transparent;pointer-events:none}' +
    '.sr-prog i{display:block;height:100%;width:0;background:linear-gradient(90deg,#6ea8fe,#f5b82e);border-radius:2px;transition:width .2s}' +
    '.sr-scroll{flex:1;min-height:0;overflow:auto;position:relative;background:#16171c;-webkit-overflow-scrolling:touch;touch-action:pan-x pan-y}' +
    '.sr-pages{position:relative;display:flex;flex-direction:column;align-items:center;min-width:100%;width:max-content;padding:14px 0;gap:14px}' +
    '.sr-page{position:relative;background:#fff;box-shadow:0 8px 28px rgba(0,0,0,.55);border-radius:2px;flex:none}' +
    '.sr-page canvas{position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none}' +
    '.sr-rib{position:absolute;top:-2px;right:6%;z-index:2;pointer-events:none;filter:drop-shadow(0 3px 3px rgba(0,0,0,.4));opacity:0;transform:translateY(-14px);transition:opacity .25s,transform .35s cubic-bezier(.3,1.5,.5,1)}' +
    '.sr-rib i{display:block;width:26px;height:48px;background:linear-gradient(180deg,#ffd470,#f0a81c);clip-path:polygon(0 0,100% 0,100% 100%,50% 80%,0 100%)}' +
    '.sr-page.bm .sr-rib{opacity:1;transform:none}' +
    '.sr-msg{padding:40px 16px;text-align:center;font-size:15px}' +
    '.sr-body{flex:1;min-height:0;display:flex;position:relative}' +
    '.sr-side{display:none;width:236px;flex:none;background:#1b1d22;border-right:1px solid #2a2d34;flex-direction:column;direction:ltr;min-height:0}' +
    '.sr-side.open{display:flex}' +
    '.sr-tabs{display:flex;gap:4px;margin:10px;padding:3px;background:#121317;border-radius:12px;direction:rtl;flex:none}' +
    '.sr-tab{flex:1;display:flex;align-items:center;justify-content:center;gap:6px;background:transparent;border:0;border-radius:9px;color:#9aa0ad;padding:8px 4px;font-family:inherit;font-size:13px;cursor:pointer;transition:background .15s,color .15s}' +
    '.sr-tab.on{background:#2b2f38;color:#fff}' +
    '.sr-badge{min-width:18px;height:18px;padding:0 5px;border-radius:9px;background:#f5b82e;color:#2a1d00;font-size:11px;line-height:18px;text-align:center}' +
    '.sr-pane{display:none;flex:1;min-height:0;overflow-y:auto;position:relative;padding:4px 0 14px}' +
    '.sr-pane.on{display:block}' +
    '.sr-th{cursor:pointer;margin:0 auto 14px;width:136px;text-align:center;font-size:12px;color:#9aa0ad}' +
    '.sr-th:hover{color:#fff}' +
    '.sr-thc{position:relative;width:136px;background:#fff;border:3px solid transparent;box-sizing:border-box;border-radius:4px;box-shadow:0 3px 10px rgba(0,0,0,.4)}' +
    '.sr-thc canvas{position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none}' +
    '.sr-th.cur .sr-thc{border-color:#6ea8fe}' +
    '.sr-th.cur{color:#fff;font-weight:bold}' +
    '.sr-th.bm .sr-thc:after{content:"";position:absolute;top:-5px;right:10px;width:14px;height:24px;background:linear-gradient(180deg,#ffd470,#f0a81c);clip-path:polygon(0 0,100% 0,100% 100%,50% 78%,0 100%)}' +
    '.sr-mk{display:flex;align-items:center;gap:12px;margin:0 10px 9px;padding:10px;background:#23262d;border:1px solid #2d3039;border-radius:14px;cursor:pointer;direction:rtl;transition:border-color .15s,background .15s}' +
    '.sr-mk:hover{background:#292d35;border-color:#3d4250}' +
    '.sr-mk.cur{border-color:#f5b82e}' +
    '.sr-mkth{position:relative;width:56px;flex:none;background:#fff;border-radius:3px;box-shadow:0 3px 8px rgba(0,0,0,.45)}' +
    '.sr-mkth canvas{position:absolute;inset:0;width:100%;height:100%;display:block}' +
    '.sr-mkth:after{content:"";position:absolute;top:-4px;right:7px;width:11px;height:20px;background:linear-gradient(180deg,#ffd470,#f0a81c);clip-path:polygon(0 0,100% 0,100% 100%,50% 78%,0 100%)}' +
    '.sr-mki{flex:1;min-width:0}' +
    '.sr-mkn{font-size:15px;font-weight:bold;color:#f2f2f6}' +
    '.sr-mks{font-size:12px;color:#9aa0ad;margin-top:2px}' +
    '.sr-mkbar{height:3px;border-radius:2px;background:#343843;margin-top:7px;overflow:hidden}' +
    '.sr-mkbar i{display:block;height:100%;background:#6ea8fe;border-radius:2px}' +
    '.sr-mkx{flex:none;width:32px;height:32px;display:flex;align-items:center;justify-content:center;border:0;border-radius:9px;background:transparent;color:#9aa0ad;cursor:pointer}' +
    '.sr-mkx:hover{background:rgba(239,83,80,.16);color:#ff8a80}' +
    '.sr-empty{padding:40px 22px;text-align:center;direction:rtl;color:#9aa0ad;font-size:13px;line-height:2}' +
    '.sr-empty svg{display:block;margin:0 auto 12px;color:#f5b82e}' +
    '.sr-mini{position:absolute;left:50%;bottom:26px;transform:translateX(-50%);z-index:6;display:flex;align-items:center;gap:8px;background:#23262d;color:#fff;border:1px solid #3a3e49;border-radius:999px;padding:8px 16px;font-size:13px;box-shadow:0 8px 24px rgba(0,0,0,.5);direction:rtl;white-space:nowrap;pointer-events:none;animation:srin .25s ease-out}' +
    '.sr-mini svg{color:#f5b82e;flex:none}' +
    '@keyframes srin{from{opacity:0;transform:translate(-50%,10px)}to{opacity:1;transform:translate(-50%,0)}}' +
    '.sr-dim{display:none;position:absolute;inset:0;z-index:2;background:rgba(0,0,0,.5)}' +
    '@media(max-width:700px),(pointer:coarse){.sr-side{position:absolute;z-index:3;top:0;bottom:0;left:0;width:84%;max-width:300px;box-shadow:6px 0 24px rgba(0,0,0,.6)}.sr-side-open .sr-dim{display:block}}' +
    '@media(max-width:600px){.sr-title,.sr-zoom{display:none}.sr-bar{gap:4px;padding:8px}.sr-bar button{width:34px}.sr-pg{width:44px}.sr-bar .sr-sp{margin-left:auto}}' +
    '@media(prefers-reduced-motion:reduce){.sr-star.pop svg,.sr-mini,.sr-rib{animation:none!important;transition:none!important}}' +
    '.sr-spacer{display:none}' +
    '.sr-srch{display:flex;gap:8px;align-items:center;margin:4px 10px 8px;padding:0 10px;background:#121317;border:1px solid #343843;border-radius:12px;direction:rtl}' +
    '.sr-srch:focus-within{border-color:#6ea8fe}' +
    '.sr-srch input{flex:1;min-width:0;height:40px;background:transparent;border:0;outline:none;color:#fff;font-family:inherit;font-size:14px;-webkit-user-select:text;user-select:text}' +
    '.sr-srch button{flex:none;width:28px;height:28px;border:0;border-radius:8px;background:transparent;color:#9aa0ad;cursor:pointer;display:none;align-items:center;justify-content:center}' +
    '.sr-srch.has button{display:flex}' +
    '.sr-srch input::-webkit-search-cancel-button,.sr-srch input::-webkit-search-decoration{-webkit-appearance:none;appearance:none;display:none}' +
    '.sr-sst{margin:0 12px 8px;font-size:12px;color:#9aa0ad;direction:rtl;line-height:1.9}' +
    '.sr-hit{display:block;width:calc(100% - 20px);margin:0 10px 8px;padding:10px 12px;text-align:right;direction:rtl;background:#23262d;border:1px solid #2d3039;border-radius:12px;color:#d7d9df;font-family:inherit;font-size:13px;line-height:1.9;cursor:pointer}' +
    '.sr-hit:hover{background:#292d35;border-color:#3d4250}' +
    '.sr-hit:focus-visible{outline:2px solid #6ea8fe;outline-offset:2px}' +
    '.sr-hit b{display:block;font-size:12px;color:#9aa0ad;font-weight:normal;margin-bottom:2px}' +
    '.sr-hit mark{background:rgba(245,184,46,.35);color:#fff;border-radius:3px;padding:0 2px}' +
    '.sr-hlc{position:absolute;inset:0;z-index:1;pointer-events:none}' +
    '.sr-hl{position:absolute;background:rgba(255,200,0,.42);mix-blend-mode:multiply;border-radius:2px;box-shadow:0 0 0 1px rgba(230,160,0,.5)}' +
    '@media(max-width:600px){.sr-zb{display:none!important}.sr-spacer{display:block;flex:1}}' +
    '.sr-fit .sr-pages{gap:10px}' +
    '.sr-t-night .sr-page canvas{filter:invert(1) hue-rotate(180deg) brightness(.92) contrast(.94)}' +
    '.sr-t-night .sr-page{background:#17181c;box-shadow:0 8px 28px rgba(0,0,0,.7)}' +
    '.sr-t-night .sr-scroll{background:#0b0c0f}' +
    '.sr-t-night .sr-hl{mix-blend-mode:screen;background:rgba(255,196,0,.34)}' +
    '.sr-t-sepia .sr-page canvas{filter:sepia(.45) saturate(.9) brightness(.98) contrast(.97)}' +
    '.sr-t-sepia .sr-page{background:#f3e9d0}' +
    '.sr-t-sepia .sr-scroll{background:#2c2822}' +
    '.sr-e1 .sr-page canvas{filter:contrast(1.2) brightness(1.04)}' +
    '.sr-e2 .sr-page canvas{filter:contrast(1.5) brightness(1.1)}' +
    '.sr-e1.sr-t-night .sr-page canvas{filter:invert(1) hue-rotate(180deg) brightness(.92) contrast(.94) contrast(1.2) brightness(1.04)}' +
    '.sr-e2.sr-t-night .sr-page canvas{filter:invert(1) hue-rotate(180deg) brightness(.92) contrast(.94) contrast(1.5) brightness(1.1)}' +
    '.sr-e1.sr-t-sepia .sr-page canvas{filter:sepia(.45) saturate(.9) brightness(.98) contrast(.97) contrast(1.2) brightness(1.04)}' +
    '.sr-e2.sr-t-sepia .sr-page canvas{filter:sepia(.45) saturate(.9) brightness(.98) contrast(.97) contrast(1.5) brightness(1.1)}' +
    '.sr-nav{display:none;align-items:center;gap:8px;margin:0 10px 8px;direction:rtl}' +
    '.sr-nav.on{display:flex}' +
    '.sr-nav button,.sr-sn button{flex:none;height:34px;min-width:34px;padding:0 12px;border:1px solid #3a3e49;border-radius:10px;background:#23262d;color:#e9e9ee;font-family:inherit;font-size:13px;cursor:pointer}' +
    '.sr-nav button:disabled,.sr-sn button:disabled{opacity:.4;cursor:default}' +
    '.sr-nav button:focus-visible,.sr-sn button:focus-visible{outline:2px solid #6ea8fe;outline-offset:2px}' +
    '.sr-nc{flex:1;text-align:center;font-size:12px;color:#9aa0ad;white-space:nowrap}' +
    '.sr-sn{position:absolute;left:50%;bottom:26px;transform:translateX(-50%);z-index:6;display:none;align-items:center;gap:6px;background:#1b1d23;border:1px solid #3a3e49;border-radius:999px;padding:5px 8px;box-shadow:0 8px 24px rgba(0,0,0,.5);direction:rtl}' +
    '.sr-sn.on{display:flex}' +
    '.sr-sn button{border-radius:999px;height:32px}' +
    '.sr-sn .sr-nc{flex:none;min-width:70px;color:#d7d9df}' +
    '.sr-cropped .sr-page{overflow:hidden}' +
    '.sr-cropped .sr-page canvas{inset:auto;width:var(--crop-w);height:var(--crop-h);left:var(--crop-l);top:var(--crop-t)}' +
    '.sr-cropped .sr-hlc{inset:auto;width:var(--crop-w);height:var(--crop-h);left:var(--crop-l);top:var(--crop-t)}' +
    '.sr-cropped .sr-rib{top:0}' +
    '.sr-bar .sr-disp.on{color:#6ea8fe}' +
    '.sr-menu{display:none;position:absolute;top:56px;right:8px;z-index:8;width:min(320px,calc(100% - 16px));box-sizing:border-box;padding:12px;background:#23262d;border:1px solid #3a3e49;border-radius:14px;box-shadow:0 12px 32px rgba(0,0,0,.55);direction:rtl;color:#e9e9ee;font-size:13px}' +
    '.sr-menu.open{display:block}' +
    '.sr-mh{font-size:12px;color:#9aa0ad;margin:2px 2px 7px}' +
    '.sr-mh:not(:first-child){margin-top:14px}' +
    '.sr-seg{display:flex;gap:4px;padding:3px;background:#121317;border-radius:11px}' +
    '.sr-seg button{flex:1;display:flex;align-items:center;justify-content:center;gap:6px;min-height:36px;padding:6px 4px;background:transparent;border:0;border-radius:8px;color:#b9bdc8;font-family:inherit;font-size:13px;cursor:pointer}' +
    '.sr-seg button.on{background:#343947;color:#fff}' +
    '.sr-seg button:focus-visible,.sr-mre:focus-visible{outline:2px solid #6ea8fe;outline-offset:2px}' +
    '.sr-sw{width:14px;height:14px;border-radius:50%;border:1px solid rgba(255,255,255,.35);flex:none}' +
    '.sr-mn{margin-top:10px;font-size:12px;color:#9aa0ad;line-height:1.8}' +
    '.sr-mre{display:none;margin-top:8px;background:transparent;border:1px solid #3a3e49;border-radius:9px;color:#b9bdc8;padding:6px 10px;font-family:inherit;font-size:12px;cursor:pointer}' +
    '.sr-mre.on{display:inline-block}' +
    '@media(pointer:coarse) and (min-width:601px){.sr-bar button{width:46px;height:46px}.sr-pg{height:38px;width:56px}.sr-tab{padding:12px 4px}.sr-mkx{width:40px;height:40px}.sr-seg button{min-height:44px}}' +
    '.sr-toast{position:absolute;top:62px;left:50%;transform:translateX(-50%);z-index:5;display:flex;align-items:center;gap:12px;background:#2f6f4f;color:#fff;padding:9px 14px;border-radius:10px;font-size:14px;box-shadow:0 6px 20px rgba(0,0,0,.5);max-width:92%;direction:rtl}' +
    '.sr-toast button{background:rgba(255,255,255,.2);border:0;color:#fff;border-radius:7px;padding:4px 10px;cursor:pointer;font-family:inherit;font-size:13px}' +
    '.sr-prog2{display:none;position:absolute;top:0;left:0;right:0;height:3px;z-index:19;pointer-events:none}' +
    '.sr-prog2 i{display:block;height:100%;width:0;background:linear-gradient(90deg,#6ea8fe,#f5b82e);border-radius:0 2px 2px 0;transition:width .2s}' +
    '.sr-chip{display:none;position:absolute;left:10px;bottom:12px;z-index:6;background:rgba(27,29,34,.85);color:#e9e9ee;border:1px solid #2a2d34;border-radius:999px;padding:4px 11px;font-size:12px;direction:ltr;unicode-bidi:isolate;pointer-events:none;-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}' +
    '.sr-auto .sr-bar{position:absolute;top:0;left:0;right:0;z-index:20;transition:transform .25s ease;box-shadow:0 4px 16px rgba(0,0,0,.35)}' +
    '.sr-auto .sr-bar.sr-hide{transform:translateY(-100%);box-shadow:none}' +
    '.sr-auto .sr-pages{padding-top:calc(var(--sr-bh,54px) + 10px)}' +
    '.sr-auto .sr-side{top:var(--sr-bh,54px)}' +
    '.sr-auto.sr-bar-hidden .sr-prog2,.sr-auto.sr-bar-hidden .sr-chip{display:block}' +
    '@media(prefers-reduced-motion:reduce){.sr-auto .sr-bar{transition:none}}' +
    '.sr-warm,.sr-dimmer{display:none;position:absolute;inset:0;z-index:4;pointer-events:none}' +
    '.sr-menu{max-height:calc(100% - 72px);overflow-y:auto;-webkit-overflow-scrolling:touch}' +
    '.sr-slh{display:flex;justify-content:space-between;align-items:center;gap:8px;margin:12px 2px 2px;font-size:13px;color:#d7d9df}' +
    '.sr-slh b{font-weight:normal;font-size:12px;color:#9aa0ad;direction:ltr;unicode-bidi:isolate}' +
    '.sr-sl input[type=range]{display:block;width:100%;height:34px;margin:0;padding:0;direction:ltr;background:transparent;accent-color:#6ea8fe;cursor:pointer}' +
    '.sr-sl input[type=range]:focus-visible{outline:2px solid #6ea8fe;outline-offset:2px;border-radius:6px}' +
    '.sr-help{display:flex}' +
    '@media(max-width:700px),(pointer:coarse){.sr-bar .sr-help{display:none}}' +
    '.sr-bar .sr-help.on{color:#6ea8fe}' +
    '.sr-bar .sr-help.nudge{animation:srnudge 1.3s ease 3}' +
    '@keyframes srnudge{0%,100%{box-shadow:0 0 0 0 rgba(110,168,254,0)}40%{box-shadow:0 0 0 7px rgba(110,168,254,.35)}}' +
    '@media(prefers-reduced-motion:reduce){.sr-bar .sr-help.nudge{animation:none}}' +
    '.sr-keys{display:none;position:absolute;top:56px;right:8px;z-index:8;width:min(350px,calc(100% - 16px));box-sizing:border-box;max-height:calc(100% - 72px);overflow-y:auto;padding:12px;background:#23262d;border:1px solid #3a3e49;border-radius:14px;box-shadow:0 12px 32px rgba(0,0,0,.55);direction:rtl;color:#e9e9ee;font-size:13px}' +
    '.sr-keys.open{display:block}' +
    '.sr-kh{font-size:14px;font-weight:bold;margin:2px 2px 6px;color:#f2f2f6}' +
    '.sr-kr{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:8px 2px;border-top:1px solid #2d3039}' +
    '.sr-kh+.sr-kr{border-top:0}' +
    '.sr-kd{flex:1;min-width:0;text-align:right;color:#d7d9df;line-height:1.7}' +
    '.sr-kk{display:flex;flex:none;gap:4px;align-items:center;flex-wrap:wrap;justify-content:flex-start;direction:ltr}' +
    '.sr-kk kbd{min-width:24px;padding:3px 7px;text-align:center;font-family:inherit;font-size:12px;color:#fff;background:#343947;border:1px solid #454b5c;border-bottom-width:2px;border-radius:6px;white-space:nowrap}' +
    '.sr-kk span{font-size:11px;color:#9aa0ad;padding:0 2px}' +
    '.sr-kn{margin:8px 2px 0;font-size:12px;color:#9aa0ad;line-height:1.8}' +
    '@media print{html.sr-open body>*{display:none!important}}';

  var IC = {
    x: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    menu: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    minus: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14"/></svg>',
    plus: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    star: '<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/></svg>',
    mark: '<svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M7 4h10a1 1 0 0 1 1 1v15l-6-4-6 4V5a1 1 0 0 1 1-1z"/></svg>',
    search: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg>',
    disp: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="8.5"/><path d="M12 3.5a8.5 8.5 0 0 1 0 17z" fill="currentColor" stroke="none"/></svg>',
    help: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="M9.6 9.6a2.5 2.5 0 1 1 3.6 2.2c-.8.45-1.2 1-1.2 1.8"/><path d="M12 16.6v.01"/></svg>',
    starS: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/></svg>'
  };
  function isCompact() {
    return window.innerWidth <= 700 || !!(window.matchMedia && window.matchMedia('(pointer:coarse)').matches);
  }
  function ibtn(svg) {
    var b = document.createElement('button');
    b.type = 'button';
    b.innerHTML = svg;
    return b;
  }

  function preload() {
    // فایل‌های خواننده را قبل از کلیک کاربر در حافظه‌ی مرورگر می‌گذارد تا باز شدن کتاب سریع‌تر شود
    try { fetch(BASE + 'pdf.worker.js', { credentials: 'same-origin' }).catch(function () {}); } catch (e) {}
    return loadPdfjs().catch(function () {});
  }

  function injectStyle() {
    if (document.getElementById('sr-style')) return;
    var st = document.createElement('style');
    st.id = 'sr-style';
    st.textContent = CSS;
    document.head.appendChild(st);
  }

  function el(tag, cls, txt) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt != null) e.textContent = txt;
    return e;
  }

  function open(o) {
    injectStyle();
    var fa = o.lang !== 'en';
    var host = o.host;
    var modalWin = host.parentNode;
    var destroyed = false;
    var doc = null, pages = [], zoom = 1, io = null, raf = 0, lastSaved = 0;
    var ZMIN = 0.5, ZMAX = 3;
    var thumbs = [], thumbIO = null, sideBuilt = false, curThumb = -1;
    var storeKey = 'pdf_market_lastpage_' + (o.bookId || '');
    var bmKey = 'pdf_market_bookmarks_' + (o.bookId || '');
    var textOn = (o.textKind === 'text');   // امکانات مخصوص PDFهای متنی فقط برای همین نوع روشن می‌شود
    var fitMode = 'normal', crop = null, theme = 'normal';
    var autoOn = false, barHidden = false, lastTop = 0, acc = 0, quietUntil = 0, tapTimer = 0, lastScrollAt = 0, hintShown = false;   // مخفی شدن خودکار نوار (موبایل)
    var helpOpen = false;
    var navRow = null, navPrev, navCnt, navNext, navPill = null, pPrev, pCnt, pNext, pX, navHits = [], navI = -1, navK = 0, navQ = '', navPillOff = false, hlOccK = 0, lastRunVal = '';   // پیمایش نتایج جستجو (بعدی/قبلی)
    var zoomSet = false;   // زوم فقط وقتی کاربر خودش عوضش کرد ذخیره می‌شود؛ وگرنه پیش‌فرض (۵۰٪) برای هر بار باز کردن
    var DEFAULT_ZOOM_PC = 0.5, DEFAULT_ZOOM_MOBILE = 0.5;
    function defaultZoom() { return isCompact() ? DEFAULT_ZOOM_MOBILE : DEFAULT_ZOOM_PC; }
    var enhSet = false;   // فقط وقتی کاربر خودش انتخاب کرد ذخیره می‌شود، تا پیش‌فرضِ هر نوع کتاب بماند
    var enh = 'low';   // پررنگ‌کردن اسکن کمرنگ: off | low | high (پیش‌فرض بار اول: کم؛ برای کتاب‌های متنی خاموش)
    var warm = 0, bright = 100;   // فیلتر نور گرم (۰ تا ۱۰۰) و روشنایی (۴۰ تا ۱۰۰)
    var blendOk = !!(window.CSS && CSS.supports && CSS.supports('mix-blend-mode', 'multiply'));
    var marks = [], tab = 'pages', markCache = {}, miniEl = null, miniTimer = 0, paneT, paneM;
    function fnum(v) { v = String(v); return fa ? v.replace(/\d/g, function (d) { return '۰۱۲۳۴۵۶۷۸۹'.charAt(Number(d)); }) : v; }

    host.innerHTML = '';
    if (modalWin && modalWin.classList) modalWin.classList.add('sr-full');
    document.documentElement.classList.add('sr-open');

    var root = el('div', 'sr-root');
    var bar = el('div', 'sr-bar');
    var btnClose = ibtn(IC.x); btnClose.title = fa ? 'بستن' : 'Close';
    var btnSide = ibtn(IC.menu); btnSide.title = fa ? 'نمایش صفحه‌ها' : 'Show pages';
    var title = el('div', 'sr-title', o.title || '');
    var btnOut = ibtn(IC.minus); btnOut.title = fa ? 'کوچک‌نمایی' : 'Zoom out';
    var zl = el('input', 'sr-zoom'); zl.type = 'text'; zl.value = '100%'; zl.setAttribute('inputmode', 'numeric'); zl.setAttribute('autocomplete', 'off'); zl.spellcheck = false;
    zl.title = fa ? 'روی عدد کلیک کن و زوم دلخواه (۵۰ تا ۳۰۰) را بنویس' : 'Click and type a zoom between 50 and 300'; zl.setAttribute('aria-label', fa ? 'درصد بزرگ‌نمایی' : 'Zoom percent');
    var btnIn = ibtn(IC.plus); btnIn.title = fa ? 'بزرگ‌نمایی' : 'Zoom in';
    var pg = el('input', 'sr-pg'); pg.type = 'number'; pg.min = 1; pg.value = 1; pg.setAttribute('aria-label', fa ? 'شماره صفحه' : 'Page number');
    var cnt = el('div', 'sr-count', '/ …');
    var btnStar = ibtn(IC.star); btnStar.className = 'sr-star'; btnStar.title = fa ? 'نشانک این صفحه' : 'Bookmark this page'; btnStar.setAttribute('aria-pressed', 'false');
    var prog = el('div', 'sr-prog'); var progBar = el('i'); prog.appendChild(progBar); prog.style[fa ? 'right' : 'left'] = '0';
    btnOut.classList.add('sr-zb'); btnIn.classList.add('sr-zb');
    var btnHelp = ibtn(IC.help); btnHelp.className = 'sr-help'; btnHelp.title = fa ? 'کلیدهای میانبر (؟)' : 'Keyboard shortcuts (?)'; btnHelp.setAttribute('aria-haspopup', 'true'); btnHelp.setAttribute('aria-expanded', 'false'); btnHelp.setAttribute('aria-keyshortcuts', '?');
    var spacerEl = el('div', 'sr-spacer');
    var btnSearch = null;
    var btnDisp = ibtn(IC.disp); btnDisp.className = 'sr-disp'; btnDisp.title = fa ? 'نمایش (رنگ و اندازه‌ی صفحه)' : 'Display'; btnDisp.setAttribute('aria-haspopup', 'true'); btnDisp.setAttribute('aria-expanded', 'false');
    if (textOn) { btnSearch = ibtn(IC.search); btnSearch.title = fa ? 'جستجو در متن کتاب' : 'Search in the book'; }
    bar.appendChild(btnClose); bar.appendChild(btnSide); bar.appendChild(title); bar.appendChild(spacerEl); bar.appendChild(btnOut); bar.appendChild(zl); bar.appendChild(btnIn); if (btnSearch) bar.appendChild(btnSearch); bar.appendChild(btnDisp); bar.appendChild(btnHelp); bar.appendChild(btnStar); bar.appendChild(pg); bar.appendChild(cnt); bar.appendChild(prog);
    var scroll = el('div', 'sr-scroll');
    var side = el('div', 'sr-side');
    var tabsEl = el('div', 'sr-tabs');
    var paneS = null, tabS = null, srIn = null, srBox = null, srSt = null, srList = null;
    var tabP = el('button', 'sr-tab on', fa ? 'صفحه‌ها' : 'Pages'); tabP.type = 'button';
    var tabM = el('button', 'sr-tab'); tabM.type = 'button';
    var tabMTxt = el('span', '', fa ? 'نشانک‌ها' : 'Bookmarks'); var tabMBadge = el('span', 'sr-badge', '0'); tabMBadge.style.display = 'none';
    tabM.appendChild(tabMTxt); tabM.appendChild(tabMBadge);
    tabsEl.appendChild(tabP); tabsEl.appendChild(tabM);
    if (textOn) {
      tabS = el('button', 'sr-tab', fa ? 'جستجو' : 'Search'); tabS.type = 'button';
      tabsEl.appendChild(tabS);
    }
    paneT = el('div', 'sr-pane on'); paneM = el('div', 'sr-pane');
    side.appendChild(tabsEl); side.appendChild(paneT); side.appendChild(paneM);
    if (textOn) {
      paneS = el('div', 'sr-pane');
      srBox = el('div', 'sr-srch');
      srIn = el('input'); srIn.type = 'search'; srIn.setAttribute('dir', 'auto'); srIn.setAttribute('enterkeyhint', 'search'); srIn.autocomplete = 'off';
      srIn.placeholder = fa ? 'جستجو در متن کتاب…' : 'Search the book…';
      srIn.setAttribute('aria-label', fa ? 'جستجو در متن کتاب' : 'Search the book');
      var srClr = ibtn(IC.x); srClr.setAttribute('aria-label', fa ? 'پاک کردن' : 'Clear');
      srBox.appendChild(srIn); srBox.appendChild(srClr);
      srSt = el('div', 'sr-sst'); srList = el('div');
      navRow = el('div', 'sr-nav');
      navPrev = el('button', '', fa ? 'قبلی' : 'Previous'); navPrev.type = 'button';
      navCnt = el('div', 'sr-nc', ''); navNext = el('button', '', fa ? 'بعدی' : 'Next'); navNext.type = 'button';
      navRow.appendChild(navPrev); navRow.appendChild(navCnt); navRow.appendChild(navNext);
      navPill = el('div', 'sr-sn'); navPill.setAttribute('role', 'group'); navPill.setAttribute('aria-label', fa ? 'پیمایش نتایج جستجو' : 'Search results');
      pPrev = el('button', '', fa ? 'قبلی' : 'Previous'); pPrev.type = 'button';
      pCnt = el('div', 'sr-nc', ''); pNext = el('button', '', fa ? 'بعدی' : 'Next'); pNext.type = 'button';
      pX = el('button', '', '×'); pX.type = 'button'; pX.setAttribute('aria-label', fa ? 'بستن' : 'Close');
      navPill.appendChild(pPrev); navPill.appendChild(pCnt); navPill.appendChild(pNext); navPill.appendChild(pX);
      root.appendChild(navPill);
      paneS.appendChild(srBox); paneS.appendChild(navRow); paneS.appendChild(srSt); paneS.appendChild(srList);
      side.appendChild(paneS);
    }
    
    var prog2 = el('div', 'sr-prog2'); var prog2Bar = el('i'); prog2.appendChild(prog2Bar);
    var chip = el('div', 'sr-chip');
    var lightW = el('div', 'sr-warm'), lightD = el('div', 'sr-dimmer');
    var dim = el('div', 'sr-dim');
    var bodyRow = el('div', 'sr-body');
    var box = el('div', 'sr-pages');
    var msg = el('div', 'sr-msg', fa ? 'در حال آماده‌سازی کتاب…' : 'Preparing your book…');
    box.appendChild(msg);
    scroll.appendChild(box);
    bodyRow.appendChild(side); bodyRow.appendChild(scroll); bodyRow.appendChild(dim); bodyRow.appendChild(lightW); bodyRow.appendChild(lightD);
    root.appendChild(bar); root.appendChild(bodyRow); root.appendChild(prog2); root.appendChild(chip);
    host.appendChild(root);

    // ───── جلوگیری از دانلود/پرینت/ذخیره از داخل خواننده ─────
    function block(e) { e.preventDefault(); }
    root.addEventListener('contextmenu', block);
    root.addEventListener('dragstart', block);
    function onKey(e) {
      if ((e.ctrlKey || e.metaKey) && /^[spu]$/i.test(e.key)) { e.preventDefault(); return; }
      handleKey(e);
    }
    document.addEventListener('keydown', onKey, true);

    btnClose.onclick = function () { if (o.onClose) o.onClose(); else destroy(); };

    function viewW() {
      var base = fitMode === 'normal' ? Math.min(scroll.clientWidth - 20, 1000) : Math.min(scroll.clientWidth - 8, 1600);
      return Math.max(200, base) * zoom;
    }
    function isCropped() { return fitMode === 'crop' && !!crop; }
    function pageWidth() { return isCropped() ? viewW() / (crop.r - crop.l) : viewW(); }

    function layout() {
      quietUntil = Date.now() + 300;
      var w = viewW(), full = pageWidth(), hk = isCropped() ? (crop.b - crop.t) : 1;
      pages.forEach(function (p) {
        p.wrap.style.width = w + 'px';
        p.wrap.style.height = Math.round(full * p.ratio * hk) + 'px';
      });
      zl.value = Math.round(zoom * 100) + '%';
    }

    function unrender(p) {
      p.token++;
      if (p.task) { try { p.task.cancel(); } catch (e) {} p.task = null; }
      if (p.canvas) { p.canvas.width = 0; p.canvas.height = 0; if (p.canvas.parentNode) p.canvas.parentNode.removeChild(p.canvas); p.canvas = null; }
      p.rendered = false; p.busy = false;
    }

    function render(p, i) {
      if (textOn && hlQ) ensureHl(i);
      if (destroyed || p.rendered || p.busy) return;
      p.busy = true;
      var tok = ++p.token;
      var big = null;   // بوم موقتِ پرجزئیات (فقط وقتی صفحه کوچک نمایش داده می‌شود)
      doc.getPage(i + 1).then(function (page) {
        if (destroyed || tok !== p.token) return;
        var v1 = page.getViewport({ scale: 1 });
        var newRatio = v1.height / v1.width;
        if (Math.abs(newRatio - p.ratio) > 0.001) { p.ratio = newRatio; layout(); }
        var w = pageWidth();
        // تراکم پیکسل: صفحه‌ی کوچک (موبایل / پنجره‌ی باریک) تا ۳ برابر، صفحه‌ی بزرگ تا ۲ برابر؛ با سقف اندازه‌ی بوم تا حافظه‌ی گوشی پر نشود
        var dpr = Math.max(0.75, Math.min(window.devicePixelRatio || 1, w < 700 ? 3 : 2, 3200 / w));
        var k = (w / v1.width) * dpr;
        var vp = page.getViewport({ scale: k });
        var fw = Math.floor(vp.width), fh = Math.floor(vp.height);
        // وقتی صفحه کوچک نمایش داده می‌شود، اول با جزئیات بیشتر کشیده و بعد با کیفیت بالا کوچک می‌شود (متن و عکس تمیزتر می‌شود)
        var ss = fw < 800 ? 3 : (fw < 1400 ? 2 : (fw < 2200 ? 1.5 : 1));
        var maxPx = isCompact() ? 4.5e6 : 12e6;
        while (ss > 1 && fw * ss * fh * ss > maxPx) ss -= 0.25;
        if (ss < 1.2) ss = 1;
        var cv = document.createElement('canvas');
        if (ss === 1) {
          cv.width = fw; cv.height = fh;
          p.canvas = cv;
          p.wrap.appendChild(cv);
          p.task = page.render({ canvasContext: cv.getContext('2d'), viewport: vp });
          return p.task.promise.then(function () {
            if (tok !== p.token) return;
            p.rendered = true; p.busy = false; p.task = null;
          });
        }
        var vpb = page.getViewport({ scale: k * ss });
        big = document.createElement('canvas');
        big.width = Math.floor(vpb.width); big.height = Math.floor(vpb.height);
        p.task = page.render({ canvasContext: big.getContext('2d'), viewport: vpb });
        return p.task.promise.then(function () {
          if (tok !== p.token) { big.width = 0; big.height = 0; big = null; return; }
          cv.width = fw; cv.height = fh;
          var cx = cv.getContext('2d');
          cx.imageSmoothingEnabled = true;
          try { cx.imageSmoothingQuality = 'high'; } catch (e) {}
          cx.drawImage(big, 0, 0, fw, fh);
          big.width = 0; big.height = 0; big = null;
          p.canvas = cv;
          p.wrap.appendChild(cv);
          p.rendered = true; p.busy = false; p.task = null;
        });
      }).catch(function (err) {
        if (big) { big.width = 0; big.height = 0; big = null; }
        if (err && err.name === 'RenderingCancelledException') return;
        if (tok === p.token) { p.busy = false; }
      });
    }

    function currentPage() {
      var y = scroll.scrollTop + scroll.clientHeight / 3;
      var lo = 0, hi = pages.length - 1;
      while (lo < hi) {
        var mid = (lo + hi + 1) >> 1;
        if (pages[mid].wrap.offsetTop <= y) lo = mid; else hi = mid - 1;
      }
      return lo;
    }

    function onScroll() {
      if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = 0;
        if (destroyed || !pages.length) return;
        var cp = currentPage();
        if (document.activeElement !== pg) pg.value = cp + 1;
        markThumb(cp);
        updateStar(cp);
        updateProgress(cp);
        if (barHidden) updateChip(cp);
        var now = Date.now();
        if (now - lastSaved > 1500) {
          lastSaved = now;
          try { localStorage.setItem(storeKey, String(cp + 1)); } catch (e) {}
          if (o.onProgress) { try { o.onProgress(cp + 1, pages.length); } catch (e) {} }
        }
      });
    }
    scroll.addEventListener('scroll', onScroll, { passive: true });

    // ───── مخفی شدن خودکار نوار بالا (فقط موبایل/لمسی) ─────
    // اسکرول به پایین (در حال خواندن) → نوار بالا می‌رود؛ اسکرول کوتاه به بالا یا تپ روی وسط صفحه → برمی‌گردد.
    function measureBar() { try { root.style.setProperty('--sr-bh', bar.offsetHeight + 'px'); } catch (e) {} }
    function applyBarMode() {
      var on = isCompact();
      if (on !== autoOn) {
        autoOn = on;
        root.classList.toggle('sr-auto', on);
        if (!on) setBarHidden(false);
      }
      measureBar();
    }
    function barLocked() {
      return side.classList.contains('open') || menu.classList.contains('open') || helpOpen || document.activeElement === pg || (srIn && document.activeElement === srIn) || !!pinch;
    }
    function updateChip(cp) { if (pages.length) chip.textContent = fnum(cp + 1) + ' / ' + fnum(pages.length); }
    function maybeHint() {
      if (hintShown) return;
      hintShown = true;
      try { if (localStorage.getItem('pdf_market_barhint')) return; localStorage.setItem('pdf_market_barhint', '1'); } catch (e) {}
      showMini(fa ? 'برای نمایش نوار، روی صفحه تپ کنید' : 'Tap the page to show the toolbar', true, 3400);
    }
    function setBarHidden(h) {
      if (h && (!autoOn || barLocked() || !pages.length)) return;
      if (h === barHidden) return;
      barHidden = h;
      acc = 0;
      bar.classList.toggle('sr-hide', h);
      root.classList.toggle('sr-bar-hidden', h);
      if (h) { updateChip(currentPage()); maybeHint(); }
    }
    scroll.addEventListener('scroll', function () {
      var y = scroll.scrollTop, d = y - lastTop;
      lastTop = y;
      lastScrollAt = Date.now();
      if (!autoOn || destroyed) return;
      if (lastScrollAt < quietUntil || Math.abs(d) > 400) { acc = 0; return; }   // پرش برنامه‌ای (رفتن به صفحه، زوم، …) حساب نمی‌شود
      if (y <= 8) { acc = 0; setBarHidden(false); return; }
      if (d === 0 || barLocked()) { if (d !== 0) acc = 0; return; }
      acc = (acc * d < 0) ? d : acc + d;                 // با عوض شدن جهت، از صفر شروع می‌شود
      if (acc > 20) setBarHidden(true);                  // چند پیکسل پایین → مخفی
      else if (acc < -12) setBarHidden(false);           // کمی بالا → نمایش
    }, { passive: true });
    bar.addEventListener('focusin', function () { setBarHidden(false); });   // کاربر کیبورد/دسترسی‌پذیری
    function scheduleBarTap(y) {
      clearTimeout(tapTimer);
      if (!autoOn) return;
      var r = scroll.getBoundingClientRect(), f = (y - r.top) / (r.height || 1);
      if (f < 0.2 || f > 0.8) return;                    // فقط تپ روی وسط صفحه
      tapTimer = setTimeout(function () { if (!destroyed && !pinch) setBarHidden(!barHidden); }, 360);   // کمی بیشتر از پنجره‌ی دابل‌تپ
    }

    function goTo(n) {
      n = Math.max(1, Math.min(pages.length, Math.floor(Number(n)) || 1));
      quietUntil = Date.now() + 300;
      scroll.scrollTop = pages[n - 1].wrap.offsetTop - 8 - (autoOn ? bar.offsetHeight : 0);
      pg.value = n;
    }
    // ───── کلیدهای میانبر (کامپیوتر) ─────
    function stepPage(dir) {
      var cp = currentPage();
      if (dir > 0) goTo(cp + 2);
      else {
        var top = pages[cp].wrap.offsetTop - 8 - (autoOn ? bar.offsetHeight : 0);
        goTo(scroll.scrollTop - top > 40 ? cp + 1 : cp);   // اگر وسط صفحه‌ایم، اول به بالای همین صفحه برمی‌گردد
      }
    }
    function scrollByY(d, smooth) {
      if (smooth && scroll.scrollBy) scroll.scrollBy({ top: d, behavior: 'smooth' }); else scroll.scrollTop += d;
    }
    function handleKey(e) {
      if (destroyed || e.ctrlKey || e.metaKey || e.altKey) return;
      var t = e.target, tag = (t && t.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (t && t.isContentEditable)) return;   // وقتی کاربر تایپ می‌کند یا اسلایدر دارد
      var k = e.key, c = e.code, used = true, has = pages.length > 0;
      if (k === 'Escape') {
        if (helpOpen) helpToggle(false);
        else if (menu.classList.contains('open')) menuOpen(false);
        else if (side.classList.contains('open')) toggleSide(false);
        else used = false;
      }
      else if (k === '?' || k === '؟' || (c === 'Slash' && e.shiftKey)) { if (!e.repeat) helpToggle(!helpOpen); }
      else if (c === 'KeyB') { if (!e.repeat) toggleMark(); }
      else if (!has) used = false;
      else if (k === 'ArrowDown') scrollByY(90);
      else if (k === 'ArrowUp') scrollByY(-90);
      else if (k === ' ' || c === 'Space') {
        if (tag === 'BUTTON') used = false;   // اسپیس روی دکمه‌ی فوکوس‌شده، همان دکمه را فشار می‌دهد
        else scrollByY((e.shiftKey ? -1 : 1) * Math.round(scroll.clientHeight * 0.85), true);
      }
      else if (k === 'ArrowRight' || k === 'PageDown') stepPage(1);
      else if (k === 'ArrowLeft' || k === 'PageUp') stepPage(-1);
      else if (k === 'Home') goTo(1);
      else if (k === 'End') goTo(pages.length);
      else if (k === '+' || k === '=' || c === 'NumpadAdd' || c === 'Equal') setZoom(zoom + 0.15);
      else if (k === '-' || c === 'NumpadSubtract' || c === 'Minus') setZoom(zoom - 0.15);
      else if (c === 'Digit0' || c === 'Numpad0') setZoom(1);
      else used = false;
      if (used) e.preventDefault();
    }
    // بعد از کلیک با ماوس/لمس، فوکوس از روی دکمه برداشته می‌شود تا اسپیس و فلش‌ها دکمه را دوباره فشار ندهند
    function blurAfterClick(e) { if (e.detail > 0) { var b = e.target && e.target.closest ? e.target.closest('button') : null; if (b) b.blur(); } }
    bar.addEventListener('click', blurAfterClick);
    side.addEventListener('click', blurAfterClick);

    pg.addEventListener('keydown', function (e) { if (e.key === 'Enter') { goTo(pg.value); pg.blur(); } });
    pg.addEventListener('change', function () { goTo(pg.value); });

    // ───── پنل صفحه‌ها (پیش‌نمایش کوچک همه‌ی صفحه‌ها) ─────
    function markThumb(cp) {
      if (!sideBuilt || cp === curThumb) return;
      if (thumbs[curThumb]) thumbs[curThumb].item.classList.remove('cur');
      curThumb = cp;
      var t = thumbs[cp];
      if (!t) return;
      t.item.classList.add('cur');
      if (side.classList.contains('open') && tab === 'pages') {
        var top = t.item.offsetTop, h = t.item.offsetHeight;
        if (top < paneT.scrollTop || top + h > paneT.scrollTop + paneT.clientHeight) paneT.scrollTop = top - paneT.clientHeight / 2 + h / 2;
      }
    }

    function thumbRender(t, i) {
      if (destroyed || !doc || t.rendered || t.busy) return;
      t.busy = true;
      var tok = ++t.token;
      doc.getPage(i + 1).then(function (page) {
        if (destroyed || tok !== t.token) return;
        var v1 = page.getViewport({ scale: 1 });
        var w = 130;
        var vp = page.getViewport({ scale: (w / v1.width) * Math.min(window.devicePixelRatio || 1, 2) });
        var cv = document.createElement('canvas');
        cv.width = Math.floor(vp.width); cv.height = Math.floor(vp.height);
        t.canvas = cv;
        t.box.appendChild(cv);
        t.task = page.render({ canvasContext: cv.getContext('2d'), viewport: vp });
        return t.task.promise.then(function () {
          if (tok !== t.token) return;
          t.rendered = true; t.busy = false; t.task = null;
        });
      }).catch(function (err) {
        if (err && err.name === 'RenderingCancelledException') return;
        if (tok === t.token) t.busy = false;
      });
    }

    function thumbUnrender(t) {
      t.token++;
      if (t.task) { try { t.task.cancel(); } catch (e) {} t.task = null; }
      if (t.canvas) { t.canvas.width = 0; t.canvas.height = 0; if (t.canvas.parentNode) t.canvas.parentNode.removeChild(t.canvas); t.canvas = null; }
      t.rendered = false; t.busy = false;
    }

    function buildThumbs() {
      if (sideBuilt || !pages.length) return;
      sideBuilt = true;
      var ratio = pages[0].ratio;
      for (var i = 0; i < pages.length; i++) {
        var item = el('div', 'sr-th');
        var tb = el('div', 'sr-thc');
        tb.style.height = Math.round(130 * ratio + 6) + 'px';
        item.appendChild(tb);
        item.appendChild(el('div', '', String(i + 1)));
        item.dataset.i = i;
        paneT.appendChild(item);
        thumbs.push({ item: item, box: tb, canvas: null, task: null, rendered: false, busy: false, token: 0 });
      }
      paneT.addEventListener('click', function (e) {
        var it = e.target.closest ? e.target.closest('.sr-th') : null;
        if (!it) return;
        goTo(Number(it.dataset.i) + 1);
        if (isCompact()) toggleSide(false);
      });
      thumbIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          var i = Number(en.target.dataset.i);
          if (en.isIntersecting) thumbRender(thumbs[i], i); else thumbUnrender(thumbs[i]);
        });
      }, { root: paneT, rootMargin: '300px 0px 300px 0px' });
      thumbs.forEach(function (t) { thumbIO.observe(t.item); });
      marks.forEach(function (m) { if (thumbs[m - 1]) thumbs[m - 1].item.classList.add('bm'); });
      curThumb = -1;
    }

    function toggleSide(force) {
      var open = typeof force === 'boolean' ? force : !side.classList.contains('open');
      side.classList.toggle('open', open);
      root.classList.toggle('sr-side-open', open);
      if (open) { setBarHidden(false); setTab(tab); }
      layout();
      if (pages.length) rebuildObserve();
      updateNavUI();
    }
    btnSide.onclick = function () { toggleSide(); };
    dim.onclick = function () { toggleSide(false); };

    function setTab(t) {
      tab = t;
      tabP.classList.toggle('on', t === 'pages');
      tabM.classList.toggle('on', t === 'marks');
      paneT.classList.toggle('on', t === 'pages');
      paneM.classList.toggle('on', t === 'marks');
      if (tabS) { tabS.classList.toggle('on', t === 'search'); paneS.classList.toggle('on', t === 'search'); }
      if (t === 'pages') {
        buildThumbs();
        var cp = currentPage();
        curThumb = -1;
        markThumb(cp);
        if (thumbs[cp]) paneT.scrollTop = thumbs[cp].item.offsetTop - paneT.clientHeight / 2;
      } else if (t === 'marks') {
        renderMarks();
      } else if (t === 'search') {
        openSearchTab();
      }
    }
    tabP.onclick = function () { setTab('pages'); };
    tabM.onclick = function () { setTab('marks'); };
    if (tabS) tabS.onclick = function () { setTab('search'); };

    // ───── نشانک‌ها ─────
    function loadMarks() {
      var arr = [];
      try { arr = JSON.parse(localStorage.getItem(bmKey) || '[]'); } catch (e) { arr = []; }
      if (!Array.isArray(arr)) arr = [];
      if (Array.isArray(o.bookmarks)) arr = arr.concat(o.bookmarks);
      var seen = {};
      marks = [];
      arr.forEach(function (v) {
        v = Math.floor(Number(v));
        if (v >= 1 && v <= pages.length && !seen[v]) { seen[v] = 1; marks.push(v); }
      });
      marks.sort(function (a, b) { return a - b; });
      marks.forEach(function (p) { pages[p - 1].wrap.classList.add('bm'); });
      updateTabBadge();
    }

    function saveMarks() {
      try { localStorage.setItem(bmKey, JSON.stringify(marks)); } catch (e) {}
      if (o.onBookmarks) { try { o.onBookmarks(marks.slice()); } catch (e) {} }
    }

    function updateTabBadge() {
      tabMBadge.textContent = fnum(marks.length);
      tabMBadge.style.display = marks.length ? '' : 'none';
    }

    function updateStar(cp) {
      var on = marks.indexOf(cp + 1) > -1;
      btnStar.classList.toggle('on', on);
      btnStar.setAttribute('aria-pressed', on ? 'true' : 'false');
      btnStar.title = on ? (fa ? 'حذف نشانک' : 'Remove bookmark') : (fa ? 'نشانک این صفحه' : 'Bookmark this page');
    }

    function updateProgress(cp) {
      if (pages.length) { var w = ((cp + 1) / pages.length * 100) + '%'; progBar.style.width = w; prog2Bar.style.width = w; }
    }

    function showMini(text, plain, ms) {
      if (miniEl && miniEl.parentNode) miniEl.parentNode.removeChild(miniEl);
      clearTimeout(miniTimer);
      miniEl = el('div', 'sr-mini');
      miniEl.innerHTML = plain ? '' : IC.starS;
      miniEl.appendChild(el('span', '', text));
      root.appendChild(miniEl);
      miniTimer = setTimeout(function () { if (miniEl && miniEl.parentNode) miniEl.parentNode.removeChild(miniEl); miniEl = null; }, ms || 1700);
    }

    function setMark(p, on) {
      var i = marks.indexOf(p);
      if (on && i === -1) { marks.push(p); marks.sort(function (a, b) { return a - b; }); }
      if (!on && i > -1) marks.splice(i, 1);
      if (!on && markCache[p]) { markCache[p].width = 0; markCache[p].height = 0; delete markCache[p]; }
      pages[p - 1].wrap.classList.toggle('bm', on);
      if (thumbs[p - 1]) thumbs[p - 1].item.classList.toggle('bm', on);
      saveMarks();
      updateTabBadge();
      updateStar(currentPage());
      if (side.classList.contains('open') && tab === 'marks') renderMarks();
    }

    function toggleMark() {
      if (!pages.length) return;
      var p = currentPage() + 1;
      var on = marks.indexOf(p) === -1;
      setMark(p, on);
      btnStar.classList.remove('pop'); void btnStar.offsetWidth; btnStar.classList.add('pop');
      setTimeout(function () { btnStar.classList.remove('pop'); }, 450);
      showMini(on ? (fa ? 'صفحه‌ی ' + fnum(p) + ' نشانک شد' : 'Page ' + p + ' bookmarked') : (fa ? 'نشانک صفحه‌ی ' + fnum(p) + ' برداشته شد' : 'Bookmark removed'));
    }
    btnStar.onclick = toggleMark;

    // ───── نمایش: رنگ صفحه (عادی/شب/سپیا) و اندازه‌ی صفحه (عادی/عرض صفحه/بدون حاشیه) ─────
    // همه‌ی این‌ها فقط نحوه‌ی نمایش را عوض می‌کنند؛ خود فایل PDF دست نمی‌خورد.
    var prefKey = 'pdf_market_reader_prefs', cropKey = 'pdf_market_crop_' + (o.bookId || '');
    function savePrefs() { try { localStorage.setItem(prefKey, JSON.stringify({ theme: theme, fit: fitMode, warm: warm, bright: bright, enh: enhSet ? enh : undefined })); } catch (e) {} }
    var zoomKey = o.bookId ? 'pdf_market_zoom_' + o.bookId : '';
    function loadBookZoom() {
      if (!zoomKey) return 0;
      try { var v = parseFloat(localStorage.getItem(zoomKey)); return (isFinite(v) && v >= ZMIN && v <= ZMAX) ? Math.round(v * 100) / 100 : 0; } catch (e) { return 0; }
    }
    function saveBookZoom() { if (zoomKey) { try { localStorage.setItem(zoomKey, String(zoom)); } catch (e) {} } }
    function loadPrefs() {
      try { var p = JSON.parse(localStorage.getItem(prefKey) || '{}'); return (p && typeof p === 'object') ? p : {}; } catch (e) { return {}; }
    }
    function loadCrop() {
      try {
        var c = JSON.parse(localStorage.getItem(cropKey) || 'null');
        if (c && c.r - c.l >= 0.4 && c.b - c.t >= 0.4 && c.l >= 0 && c.t >= 0 && c.r <= 1 && c.b <= 1) return c;
      } catch (e) {}
      return null;
    }
    function applyCropVars() {
      if (!crop) return;
      var cw = crop.r - crop.l, ch = crop.b - crop.t;
      root.style.setProperty('--crop-w', (100 / cw) + '%'); root.style.setProperty('--crop-h', (100 / ch) + '%');
      root.style.setProperty('--crop-l', (-crop.l / cw * 100) + '%'); root.style.setProperty('--crop-t', (-crop.t / ch * 100) + '%');
    }

    var menu = el('div', 'sr-menu'); menu.setAttribute('role', 'dialog'); menu.setAttribute('aria-label', fa ? 'تنظیمات نمایش' : 'Display settings');
    function seg(items, onPick) {
      var box = el('div', 'sr-seg'), btns = {};
      items.forEach(function (it) {
        var b = el('button'); b.type = 'button';
        if (it.sw) { var sw = el('span', 'sr-sw'); sw.style.background = it.sw; b.appendChild(sw); }
        b.appendChild(el('span', '', it.t));
        b.onclick = function () { onPick(it.k); };
        box.appendChild(b); btns[it.k] = b;
      });
      return { box: box, btns: btns };
    }
    var segT = seg([{ k: 'normal', t: fa ? 'عادی' : 'Normal', sw: '#fff' }, { k: 'night', t: fa ? 'شب' : 'Night', sw: '#111' }, { k: 'sepia', t: fa ? 'سپیا' : 'Sepia', sw: '#e8d8b0' }], function (k) { setTheme(k); });
    var segF = seg([{ k: 'normal', t: fa ? 'عادی' : 'Normal' }, { k: 'fit', t: fa ? 'عرض صفحه' : 'Fit width' }, { k: 'crop', t: fa ? 'بدون حاشیه' : 'No margins' }], function (k) { chooseFit(k); });
    var mre = el('button', 'sr-mre', fa ? 'تشخیص دوباره‌ی حاشیه' : 'Detect margins again'); mre.type = 'button';
    menu.appendChild(el('div', 'sr-mh', fa ? 'رنگ صفحه' : 'Page color')); menu.appendChild(segT.box);
    // ───── پررنگ‌کردن اسکن کمرنگ (فقط نمایش؛ فایل و تصویرها دست نمی‌خورند) ─────
    var segE = seg([{ k: 'off', t: fa ? 'خاموش' : 'Off' }, { k: 'low', t: fa ? 'کم' : 'Low' }, { k: 'high', t: fa ? 'زیاد' : 'High' }], function (k) { setEnh(k); });
    menu.appendChild(el('div', 'sr-mh', fa ? 'پررنگ‌کردن اسکن کمرنگ' : 'Boost faded scans')); menu.appendChild(segE.box);
    menu.appendChild(el('div', 'sr-mn', fa ? 'نوشته را تیره‌تر و زمینه را روشن‌تر نشان می‌دهد. اگر عکس‌ها یا خط‌های نازک بد دیده شدند، «کم» یا «خاموش» را بزنید.' : 'Makes text darker and the page brighter. If images or thin lines look wrong, choose Low or Off.'));
    // ───── نور: فیلتر نور گرم و روشنایی (برای مطالعه‌ی شبانه) ─────
    function slider(label, min, max, step, get, set) {
      var box = el('div', 'sr-sl'), head = el('div', 'sr-slh'), val = el('b', '', '');
      head.appendChild(el('span', '', label)); head.appendChild(val);
      var inp = el('input'); inp.type = 'range'; inp.min = min; inp.max = max; inp.step = step; inp.value = get();
      inp.setAttribute('aria-label', label);
      function show() { val.textContent = fnum(get()) + '%'; }
      inp.addEventListener('input', function () { set(Number(inp.value)); show(); applyLight(); });
      inp.addEventListener('change', function () { savePrefs(); updateMenu(); });
      box.appendChild(head); box.appendChild(inp);
      return { box: box, inp: inp, sync: function () { inp.value = get(); show(); } };
    }
    var slW = slider(fa ? 'نور گرم' : 'Warm light', 0, 100, 5, function () { return warm; }, function (v) { warm = v; });
    var slB = slider(fa ? 'روشنایی' : 'Brightness', 40, 100, 5, function () { return bright; }, function (v) { bright = v; });
    var lre = el('button', 'sr-mre', fa ? 'بازنشانی نور' : 'Reset light'); lre.type = 'button';
    lre.onclick = function () { warm = 0; bright = 100; applyLight(); savePrefs(); updateMenu(); };
    function applyLight() {
      if (warm > 0) {
        var t = warm / 100 * 0.9;
        lightW.style.display = 'block';
        if (blendOk) { lightW.style.mixBlendMode = 'multiply'; lightW.style.background = 'rgb(255,' + Math.round(255 - 115 * t) + ',' + Math.round(255 - 205 * t) + ')'; }
        else { lightW.style.mixBlendMode = ''; lightW.style.background = 'rgba(255,150,40,' + (0.4 * warm / 100).toFixed(3) + ')'; }
      } else lightW.style.display = 'none';
      var d = (100 - bright) / 100;
      lightD.style.display = d > 0 ? 'block' : 'none';
      lightD.style.background = 'rgba(0,0,0,' + d.toFixed(3) + ')';
    }
    menu.appendChild(el('div', 'sr-mh', fa ? 'نور (مطالعه‌ی شبانه)' : 'Light (night reading)')); menu.appendChild(slW.box); menu.appendChild(slB.box); menu.appendChild(lre);
    menu.appendChild(el('div', 'sr-mh', fa ? 'اندازه‌ی صفحه' : 'Page size')); menu.appendChild(segF.box);
    menu.appendChild(el('div', 'sr-mn', fa ? '«بدون حاشیه» حاشیه‌ی سفید دور متن را مخفی می‌کند. فقط نمایش عوض می‌شود، نه فایل.' : '"No margins" hides the blank border around the text. Only the display changes, not the file.'));
    menu.appendChild(mre);
    root.appendChild(menu);

    // ───── راهنمای کلیدهای میانبر (دکمه‌ی ؟) ─────
    var helpPop = el('div', 'sr-keys'); helpPop.setAttribute('role', 'dialog'); helpPop.setAttribute('aria-label', fa ? 'کلیدهای میانبر' : 'Keyboard shortcuts');
    helpPop.appendChild(el('div', 'sr-kh', fa ? 'کلیدهای میانبر' : 'Keyboard shortcuts'));
    (function () {
      var K = function (a) { return { k: a }; }, T = function (a) { return { t: a }; };
      var rows = [
        [[K('↑'), K('↓')], fa ? 'حرکت آرام صفحه' : 'Scroll slowly'],
        [[K('Space'), T(fa ? 'یا' : 'or'), K('Shift'), T('+'), K('Space')], fa ? 'یک صفحه‌ی نمایش پایین / بالا' : 'One screen down / up'],
        [[K('→'), K('←'), T(fa ? 'یا' : 'or'), K('PgDn'), K('PgUp')], fa ? 'صفحه‌ی بعد / قبل' : 'Next / previous page'],
        [[K('Home'), K('End')], fa ? 'اول / آخر کتاب' : 'Start / end of the book'],
        [[K('+'), K('−'), K('0')], fa ? 'بزرگ‌نمایی / کوچک‌نمایی / اندازه‌ی اصلی' : 'Zoom in / out / reset'],
        [[K('B')], fa ? 'نشانک‌گذاری صفحه‌ی فعلی' : 'Bookmark this page'],
        [[K('?')], fa ? 'باز و بسته کردن همین راهنما' : 'Open / close this help'],
        [[K('Esc')], fa ? 'بستن پنل‌ها' : 'Close panels']
      ];
      rows.forEach(function (r) {
        var row = el('div', 'sr-kr'), kk = el('div', 'sr-kk');
        r[0].forEach(function (x) { kk.appendChild(x.k ? el('kbd', '', x.k) : el('span', '', x.t)); });
        row.appendChild(el('div', 'sr-kd', r[1])); row.appendChild(kk);
        helpPop.appendChild(row);
      });
      helpPop.appendChild(el('div', 'sr-kn', fa ? 'وقتی داخل کادر جستجو یا شماره‌ی صفحه تایپ می‌کنی، این کلیدها کار نمی‌کنند.' : 'Shortcuts are off while you type in the search or page box.'));
    })();
    root.appendChild(helpPop);
    function helpToggle(on) {
      if (on === helpOpen) return;
      helpOpen = on;
      helpPop.classList.toggle('open', on);
      btnHelp.classList.toggle('on', on);
      btnHelp.classList.remove('nudge');
      btnHelp.setAttribute('aria-expanded', on ? 'true' : 'false');
      if (on) menuOpen(false);
    }
    btnHelp.onclick = function (e) { e.stopPropagation(); helpToggle(!helpOpen); };
    function outsideHelp(e) { if (helpOpen && !helpPop.contains(e.target) && !btnHelp.contains(e.target)) helpToggle(false); }
    document.addEventListener('pointerdown', outsideHelp, true);
    function keyHint() {
      try { if (localStorage.getItem('pdf_market_keyhint')) return; localStorage.setItem('pdf_market_keyhint', '1'); } catch (e) { return; }
      btnHelp.classList.add('nudge');
      setTimeout(function () { if (!destroyed) showMini(fa ? 'برای دیدن کلیدهای میانبر، روی ؟ بزنید' : 'Press ? or click the ? button for shortcuts', true, 4200); }, 1200);
    }

    function updateMenu() {
      Object.keys(segT.btns).forEach(function (k) { segT.btns[k].classList.toggle('on', k === theme); });
      Object.keys(segF.btns).forEach(function (k) { segF.btns[k].classList.toggle('on', k === fitMode); });
      Object.keys(segE.btns).forEach(function (k) { segE.btns[k].classList.toggle('on', k === enh); });
      mre.classList.toggle('on', fitMode === 'crop');
      slW.sync(); slB.sync();
      lre.classList.toggle('on', warm > 0 || bright < 100);
      btnDisp.classList.toggle('on', theme !== 'normal' || fitMode !== 'normal' || warm > 0 || bright < 100);
    }
    function applyEnh() {
      root.classList.remove('sr-e1', 'sr-e2');
      if (enh === 'low') root.classList.add('sr-e1'); else if (enh === 'high') root.classList.add('sr-e2');
    }
    function setEnh(k) { enhSet = true; enh = (k === 'low' || k === 'high') ? k : 'off'; applyEnh(); savePrefs(); updateMenu(); }
    function setTheme(t) {
      theme = t;
      root.classList.remove('sr-t-night', 'sr-t-sepia');
      if (t !== 'normal') root.classList.add('sr-t-' + t);
      savePrefs(); updateMenu();
    }
    function setFit(mode) {
      if (!pages.length) { fitMode = mode; return; }
      var idx = currentPage(), p0 = pages[idx];
      var frac = p0.wrap.offsetHeight ? (scroll.scrollTop - p0.wrap.offsetTop) / p0.wrap.offsetHeight : 0;
      fitMode = mode; zoom = (mode === 'normal') ? defaultZoom() : 1; zoomSet = false;
      root.classList.toggle('sr-fit', mode !== 'normal');
      root.classList.toggle('sr-cropped', isCropped());
      if (isCropped()) applyCropVars();
      layout();
      scroll.scrollTop = p0.wrap.offsetTop + frac * p0.wrap.offsetHeight;
      rebuildObserve();
      savePrefs(); updateMenu();
    }
    var detecting = false;
    function chooseFit(mode, force) {
      if (mode !== 'crop') { setFit(mode); return; }
      if (crop && !force) { setFit('crop'); return; }
      if (detecting) return;
      detecting = true;
      showMini(fa ? 'در حال تشخیص حاشیه…' : 'Detecting margins…', true);
      detectCrop().then(function (c) {
        detecting = false;
        if (destroyed) return;
        if (!c) { showMini(fa ? 'حاشیه‌ی قابل‌توجهی پیدا نشد' : 'No significant margins found', true); setFit(fitMode === 'crop' ? 'fit' : (fitMode === 'normal' ? 'fit' : fitMode)); return; }
        crop = c;
        try { localStorage.setItem(cropKey, JSON.stringify(c)); } catch (e) {}
        setFit('crop');
      }, function () { detecting = false; showMini(fa ? 'تشخیص حاشیه ممکن نشد' : 'Could not detect margins', true); });
    }
    mre.onclick = function () { chooseFit('crop', true); };

    // نمونه‌ی چند صفحه را کوچک می‌کشیم و نزدیک‌ترین کادرِ شامل متن را پیدا می‌کنیم
    function inkBox(data, w, h) {
      var n = w * h, lum = new Uint8Array(n), hist = new Uint32Array(256), i;
      for (i = 0; i < n; i++) { var v = (data[i * 4] * 299 + data[i * 4 + 1] * 587 + data[i * 4 + 2] * 114) / 1000 | 0; lum[i] = v; hist[v]++; }
      var acc = 0, bg = 255, target = n * 0.85;
      for (i = 0; i < 256; i++) { acc += hist[i]; if (acc >= target) { bg = i; break; } }
      var thr = bg * 0.72, bx = Math.round(w * 0.015), by = Math.round(h * 0.015);
      var col = new Uint16Array(w), row = new Uint16Array(h), ink = 0, x, y;
      for (y = by; y < h - by; y++) for (x = bx; x < w - bx; x++) if (lum[y * w + x] < thr) { col[x]++; row[y]++; ink++; }
      if (ink < n * 0.002) return null;
      var l = -1, r = -1, t = -1, b = -1;
      for (x = bx; x < w - bx; x++) if (col[x] >= 3) { if (l < 0) l = x; r = x; }
      for (y = by; y < h - by; y++) if (row[y] >= 3) { if (t < 0) t = y; b = y; }
      if (l < 0 || t < 0) return null;
      return { l: l / w, r: (r + 1) / w, t: t / h, b: (b + 1) / h };
    }
    function pctl(arr, q) { arr = arr.slice().sort(function (a, b) { return a - b; }); return arr[Math.max(0, Math.min(arr.length - 1, Math.floor(q * (arr.length - 1))))]; }
    function detectCrop() {
      var n = pages.length, from = 1, to = n;
      if (n > 8) { from = 2; to = n - 1; }
      var cnt = Math.min(12, to - from + 1), list = [], k;
      for (k = 0; k < cnt; k++) list.push(from + (cnt === 1 ? 0 : Math.floor(k * (to - from) / (cnt - 1))));
      var boxes = [];
      function one(i) {
        if (i >= list.length || destroyed) return Promise.resolve();
        return doc.getPage(list[i]).then(function (pg) {
          var v1 = pg.getViewport({ scale: 1 }), vp = pg.getViewport({ scale: 420 / v1.width });
          var cv = document.createElement('canvas'); cv.width = Math.floor(vp.width); cv.height = Math.floor(vp.height);
          var ctx = cv.getContext('2d', { willReadFrequently: true });
          return pg.render({ canvasContext: ctx, viewport: vp }).promise.then(function () {
            var bb = inkBox(ctx.getImageData(0, 0, cv.width, cv.height).data, cv.width, cv.height);
            if (bb) boxes.push(bb);
            cv.width = 0; cv.height = 0; try { pg.cleanup(); } catch (e) {}
          });
        }).catch(function () {}).then(function () { return one(i + 1); });
      }
      return one(0).then(function () {
        if (boxes.length < 3) return null;
        var l = pctl(boxes.map(function (b) { return b.l; }), 0.08), t = pctl(boxes.map(function (b) { return b.t; }), 0.08);
        var r = pctl(boxes.map(function (b) { return b.r; }), 0.92), b2 = pctl(boxes.map(function (b) { return b.b; }), 0.92);
        l = Math.max(0, l - 0.02); r = Math.min(1, r + 0.02); t = Math.max(0, t - 0.015); b2 = Math.min(1, b2 + 0.015);
        if (r - l < 0.45 || b2 - t < 0.45) return null;
        if (r - l > 0.93 && b2 - t > 0.93) return null;
        return { l: l, t: t, r: r, b: b2, v: 1 };
      });
    }

    // باز و بسته شدن منو
    function menuOpen(on) {
      menu.classList.toggle('open', on);
      btnDisp.setAttribute('aria-expanded', on ? 'true' : 'false');
      if (on) { setBarHidden(false); helpToggle(false); updateMenu(); }
    }
    btnDisp.onclick = function (e) { e.stopPropagation(); menuOpen(!menu.classList.contains('open')); };
    function outside(e) { if (menu.classList.contains('open') && !menu.contains(e.target) && !btnDisp.contains(e.target)) menuOpen(false); }
    document.addEventListener('pointerdown', outside, true);

    // تنظیمات ذخیره‌شده‌ی کاربر
    (function () {
      var pr = loadPrefs();
      if (pr.theme === 'night' || pr.theme === 'sepia') { theme = pr.theme; root.classList.add('sr-t-' + theme); }
      if (typeof pr.warm === 'number' && isFinite(pr.warm)) warm = Math.max(0, Math.min(100, Math.round(pr.warm)));
      if (typeof pr.bright === 'number' && isFinite(pr.bright)) bright = Math.max(40, Math.min(100, Math.round(pr.bright)));
      // اگر کاربر برای همین کتاب خودش زوم گذاشته بود همان بازیابی می‌شود؛ وگرنه پیش‌فرض (۵۰٪)
      var sz = loadBookZoom();
      if (sz) { zoom = sz; zoomSet = true; }
      else zoom = defaultZoom();                                                                                                                                      // بار اول: ۵۰٪
      zl.value = Math.round(zoom * 100) + '%';
      if (pr.enh === 'off' || pr.enh === 'low' || pr.enh === 'high') { enh = pr.enh; enhSet = true; }   // انتخاب خودِ کاربر
      else enh = textOn ? 'off' : 'low';                                              // بار اول: برای اسکن‌ها «کم»
      applyEnh();
      applyLight();
      crop = loadCrop();
      fitMode = 'normal';   // حالت نمایش (عرض صفحه/برش حاشیه) هم از دفعه‌ی قبل بازیابی نمی‌شود؛ هر بار با ۵۰٪ شروع می‌شود
      if (fitMode === 'crop' && !crop) fitMode = 'normal';   // تشخیص حاشیه بعد از باز شدن کتاب دوباره اجرا می‌شود
      updateMenu();
    })();

    // ───── جستجوی متن (فقط برای PDFهای متنی) ─────
    var idx = null, idxDone = 0, idxRun = false, idxFinished = false, srTimer = 0, hlQ = '', hlSet = {}, hlTarget = 0;
    function norm(v) {
      v = String(v || '');
      try { v = v.normalize('NFKC'); } catch (e) {}
      v = v.replace(/[\u064A\u0649]/g, '\u06CC').replace(/\u0643/g, '\u06A9').replace(/[\u0629\u06D5]/g, '\u0647')
           .replace(/[\u064B-\u065F\u0670\u0640\u200B-\u200F\u202A-\u202E\u00AD\u06D6-\u06ED\uFEFF]/g, '')
           .replace(/[\u06F0-\u06F9]/g, function (d) { return String(d.charCodeAt(0) - 0x6F0); })
           .replace(/[\u0660-\u0669]/g, function (d) { return String(d.charCodeAt(0) - 0x660); })
           .replace(/\s+/g, ' ');
      return v.toLowerCase().trim();
    }
    function pageText(items) { return items.map(function (it) { return norm(it.str); }).join(' '); }
    function progressText() {
      return (fa ? 'در حال آماده‌سازی جستجو… ' : 'Preparing search… ') + fnum(Math.round(idxDone / Math.max(1, pages.length) * 100)) + (fa ? '٪' : '%');
    }
    function buildIndex() {
      if (idxRun || !doc || !pages.length) return;
      idxRun = true; idx = new Array(pages.length); idxDone = 0;
      (function step(i) {
        if (destroyed) return;
        if (i >= idx.length) { idxFinished = true; runSearch(); return; }
        doc.getPage(i + 1).then(function (pg) {
          return pg.getTextContent().then(function (tc) { idx[i] = pageText(tc.items); try { pg.cleanup(); } catch (e) {} });
        }).catch(function () { idx[i] = ''; }).then(function () {
          idxDone = i + 1;
          if (srIn.value && i % 25 === 24) runSearch();
          if (i % 4 === 3) setTimeout(function () { step(i + 1); }, 0); else step(i + 1);
        });
      })(0);
    }
    function openSearchTab() {
      buildIndex();
      runSearch();
      setTimeout(function () { try { srIn.focus(); } catch (e) {} }, 60);
    }
    function mulM(a, b) {
      return [a[0] * b[0] + a[2] * b[1], a[1] * b[0] + a[3] * b[1], a[0] * b[2] + a[2] * b[3], a[1] * b[2] + a[3] * b[3],
              a[0] * b[4] + a[2] * b[5] + a[4], a[1] * b[4] + a[3] * b[5] + a[5]];
    }
    function clearHl() {
      pages.forEach(function (p) {
        if (p.hlc && p.hlc.parentNode) p.hlc.parentNode.removeChild(p.hlc);
        p.hlc = null; p.hlQ = ''; p.hlBusy = false; p.hlFirst = null; p.hlOcc = null;
      });
      hlQ = ''; hlSet = {}; hlTarget = 0;
    }
    function ensureHl(i) {
      var n = i + 1;
      if (!hlQ || !hlSet[n] || !doc || destroyed) return;
      var p = pages[i];
      if (!p || p.hlBusy || p.hlQ === hlQ) return;
      p.hlBusy = true;
      var q = hlQ;
      doc.getPage(n).then(function (page) {
        return page.getTextContent().then(function (tc) {
          if (destroyed || q !== hlQ) { p.hlBusy = false; return; }
          var vp = page.getViewport({ scale: 1 });
          var items = tc.items, strs = [], starts = [], full = '', pos = 0, k;
          for (k = 0; k < items.length; k++) { var ns = norm(items[k].str); starts.push(pos); strs.push(ns); full += ns + ' '; pos += ns.length + 1; }
          var hit = {}, occ = [], tops = {}, at = full.indexOf(q), guard = 0;
          while (at > -1 && guard++ < 300) {
            var en = at + q.length, oi = [];
            for (k = 0; k < items.length; k++) if (strs[k] && starts[k] < en && starts[k] + strs[k].length > at) { hit[k] = 1; oi.push(k); }
            occ.push(oi);
            at = full.indexOf(q, en);
          }
          var box = document.createElement('div'); box.className = 'sr-hlc';
          var first = null;
          Object.keys(hit).forEach(function (kk) {
            var it = items[kk], m = mulM(vp.transform, it.transform);
            var h = Math.sqrt(m[2] * m[2] + m[3] * m[3]) || 10, w = it.width || 0;
            if (!w) return;
            var top = (m[5] - h * 0.88) / vp.height * 100;
            tops[kk] = top;
            var d = document.createElement('div'); d.className = 'sr-hl';
            d.style.left = (m[4] / vp.width * 100) + '%'; d.style.top = top + '%';
            d.style.width = (w / vp.width * 100) + '%'; d.style.height = (h * 1.12 / vp.height * 100) + '%';
            box.appendChild(d);
            if (first === null || top < first) first = top;
          });
          if (p.hlc && p.hlc.parentNode) p.hlc.parentNode.removeChild(p.hlc);
          p.hlOcc = occ.map(function (oi) { var t = null; oi.forEach(function (kk) { if (typeof tops[kk] === 'number' && (t === null || tops[kk] < t)) t = tops[kk]; }); return t; });
          p.wrap.appendChild(box); p.hlc = box; p.hlQ = q; p.hlBusy = false; p.hlFirst = first;
          if (hlTarget === n && first !== null) { hlTarget = 0; scrollToHl(n); }
        });
      }).catch(function () { p.hlBusy = false; });
    }
    function scrollToHl(n) {
      var p = pages[n - 1];
      if (!p || p.hlFirst === null || p.hlFirst === undefined) return;
      var f = ((p.hlOcc && typeof p.hlOcc[hlOccK] === 'number') ? p.hlOcc[hlOccK] : p.hlFirst) / 100;
      if (isCropped()) f = (f - crop.t) / (crop.b - crop.t);
      scroll.scrollTop = Math.max(0, p.wrap.offsetTop + f * p.wrap.offsetHeight - scroll.clientHeight / 3);
    }
    function setHl(qn, pageList) {
      clearHl();
      hlQ = qn;
      pageList.forEach(function (n) { hlSet[n] = 1; });
      var cp = currentPage();
      for (var i = Math.max(0, cp - 2); i <= Math.min(pages.length - 1, cp + 3); i++) ensureHl(i);
    }
    function runSearch() {
      if (!textOn) return;
      var q = srIn.value, qn = norm(q);
      lastRunVal = q;
      srBox.classList.toggle('has', q.length > 0);
      srList.innerHTML = '';
      if (!idx) { navHits = []; navI = -1; navK = 0; navQ = ''; updateNavUI(); srSt.textContent = fa ? 'کتاب هنوز آماده نیست؛ چند لحظه‌ی دیگر دوباره امتحان کن.' : 'The book is not ready yet.'; return; }
      if (qn.length < 2) {
        clearHl(); navHits = []; navI = -1; navK = 0; navQ = ''; updateNavUI();
        srSt.textContent = idxFinished ? (fa ? 'حداقل دو حرف بنویس.' : 'Type at least two characters.') : progressText();
        return;
      }
      var hits = [], total = 0;
      for (var i = 0; i < idx.length; i++) {
        var t = idx[i];
        if (t == null) continue;
        var at = t.indexOf(qn);
        if (at === -1) continue;
        var c = 0, ps = at;
        while (ps > -1 && c < 99) { c++; ps = t.indexOf(qn, ps + qn.length); }
        total += c; hits.push({ page: i + 1, at: at, c: c, t: t });
      }
      var keepPage = (navQ === qn && navI >= 0 && navHits[navI]) ? navHits[navI].page : 0;
      navHits = hits; navQ = qn; navI = -1;
      if (keepPage) for (var ni = 0; ni < hits.length; ni++) if (hits[ni].page === keepPage) { navI = ni; break; }
      if (navI >= 0) navK = Math.min(navK, hits[navI].c - 1); else navK = 0;
      updateNavUI();
      if (!hits.length) srSt.textContent = idxFinished ? (fa ? 'نتیجه‌ای پیدا نشد.' : 'No results.') : progressText();
      else srSt.textContent = (fa ? fnum(total) + (total >= 99 * 1 && false ? '+' : '') + ' مورد در ' + fnum(hits.length) + ' صفحه' : total + ' matches on ' + hits.length + ' pages') + (idxFinished ? '' : ' — ' + progressText());
      hits.slice(0, 200).forEach(function (h, hi) {
        var b = el('button', 'sr-hit'); b.type = 'button';
        b.appendChild(el('b', '', (fa ? 'صفحه ' : 'Page ') + fnum(h.page) + (h.c > 1 ? ' · ' + fnum(h.c) + (fa ? ' مورد' : ' matches') : '')));
        var s0 = Math.max(0, h.at - 28), e0 = Math.min(h.t.length, h.at + qn.length + 44);
        b.appendChild(document.createTextNode((s0 > 0 ? '… ' : '') + h.t.slice(s0, h.at)));
        b.appendChild(el('mark', '', h.t.slice(h.at, h.at + qn.length)));
        b.appendChild(document.createTextNode(h.t.slice(h.at + qn.length, e0) + (e0 < h.t.length ? ' …' : '')));
        b.onclick = function () {
          navI = hi; navK = 0; hlOccK = 0; navPillOff = false; updateNavUI();
          goTo(h.page);
          var pp = pages[h.page - 1];
          if (pp && pp.hlQ === hlQ && pp.hlFirst !== null && pp.hlFirst !== undefined) scrollToHl(h.page);
          else { hlTarget = h.page; ensureHl(h.page - 1); }
          if (isCompact()) toggleSide(false);
        };
        srList.appendChild(b);
      });
      if (hits.length > 200) srList.appendChild(el('div', 'sr-sst', fa ? 'فقط ۲۰۰ صفحه‌ی اول نشان داده شد؛ عبارت دقیق‌تری بنویس.' : 'Showing the first 200 pages.'));
      setHl(qn, hits.map(function (h) { return h.page; }));
    }
    // ───── بعدی / قبلی در نتایج جستجو (بدون چرخش: در آخرین نتیجه می‌ایستد) ─────
    function navTotal() { var t = 0; navHits.forEach(function (h) { t += h.c; }); return t; }
    function navPos() { var n = 0; for (var i = 0; i < navI; i++) n += navHits[i].c; return n + navK + 1; }
    function updateNavUI() {
      if (!navRow) return;
      var has = navHits.length > 0, tot = navTotal();
      var txt = navI < 0 ? (fa ? fnum(tot) + ' مورد' : tot + ' matches') : (fa ? fnum(navPos()) + ' از ' + fnum(tot) : navPos() + ' of ' + tot);
      navCnt.textContent = txt; pCnt.textContent = txt;
      var atEnd = navI >= 0 && navI === navHits.length - 1 && navK >= navHits[navI].c - 1;
      var atStart = navI === 0 && navK === 0;
      navNext.disabled = pNext.disabled = !has || atEnd;
      navPrev.disabled = pPrev.disabled = !has || atStart;
      navRow.classList.toggle('on', has);
      navPill.classList.toggle('on', has && !navPillOff && !side.classList.contains('open'));
    }
    function navGo(i, k) {
      navI = i; navK = k; hlOccK = k;
      var h = navHits[i];
      if (isCompact() && side.classList.contains('open')) toggleSide(false);
      goTo(h.page);
      var pp = pages[h.page - 1];
      if (pp && pp.hlQ === hlQ && pp.hlFirst !== null && pp.hlFirst !== undefined) scrollToHl(h.page);
      else { hlTarget = h.page; ensureHl(h.page - 1); }
      updateNavUI();
    }
    function navStep(dir) {
      if (!navHits.length) return;
      navPillOff = false;
      var i, k;
      if (navI < 0) {   // هنوز نتیجه‌ای انتخاب نشده: از نزدیک‌ترین نتیجه به صفحه‌ی فعلی شروع کن
        var cur = currentPage() + 1;
        if (dir > 0) { for (i = 0; i < navHits.length; i++) if (navHits[i].page >= cur) break; if (i >= navHits.length) i = navHits.length - 1; navGo(i, 0); }
        else { for (i = navHits.length - 1; i >= 0; i--) if (navHits[i].page <= cur) break; if (i < 0) { navGo(0, 0); } else navGo(i, navHits[i].c - 1); }
        return;
      }
      i = navI; k = navK + dir;
      if (k >= navHits[i].c) { i++; k = 0; if (i >= navHits.length) return; }
      else if (k < 0) { i--; if (i < 0) return; k = navHits[i].c - 1; }
      navGo(i, k);
    }
    if (textOn) {
      navNext.onclick = pNext.onclick = function () { navStep(1); };
      navPrev.onclick = pPrev.onclick = function () { navStep(-1); };
      pX.onclick = function () { navPillOff = true; updateNavUI(); };
    }
    if (textOn) {
      srIn.addEventListener('input', function () { clearTimeout(srTimer); srBox.classList.toggle('has', srIn.value.length > 0); srTimer = setTimeout(runSearch, 250); });
      srIn.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter') return;
        clearTimeout(srTimer);
        if (srIn.value !== lastRunVal || !navHits.length) { runSearch(); return; }   // اولین Enter فقط جستجو می‌کند (مثل قبل)
        e.preventDefault(); navStep(e.shiftKey ? -1 : 1);                             // Enter: بعدی  ·  Shift+Enter: قبلی
      });
      srClr.onclick = function () { srIn.value = ''; runSearch(); srIn.focus(); };
      btnSearch.onclick = function () { toggleSide(true); setTab('search'); };
    }

    function markThumbRender(box, p) {
      if (markCache[p]) { box.appendChild(markCache[p]); return; }
      doc.getPage(p).then(function (page) {
        if (destroyed || marks.indexOf(p) === -1) return;
        var v1 = page.getViewport({ scale: 1 });
        var vp = page.getViewport({ scale: (56 / v1.width) * Math.min(window.devicePixelRatio || 1, 2) });
        var cv = document.createElement('canvas');
        cv.width = Math.floor(vp.width); cv.height = Math.floor(vp.height);
        return page.render({ canvasContext: cv.getContext('2d'), viewport: vp }).promise.then(function () {
          if (destroyed || marks.indexOf(p) === -1) { cv.width = 0; cv.height = 0; return; }
          markCache[p] = cv;
          if (box.isConnected) box.appendChild(cv);
        });
      }).catch(function () {});
    }

    function renderMarks() {
      paneM.innerHTML = '';
      if (!marks.length) {
        var em = el('div', 'sr-empty');
        em.innerHTML = IC.mark;
        em.appendChild(el('div', '', fa ? 'هنوز نشانکی نداری. ستاره‌ی بالای صفحه رو بزن تا صفحه‌ی فعلی ذخیره بشه.' : 'No bookmarks yet. Tap the star to save the current page.'));
        paneM.appendChild(em);
        return;
      }
      var cp = currentPage() + 1;
      var ratio = pages.length ? pages[0].ratio : 1.4;
      marks.forEach(function (p) {
        var card = el('div', 'sr-mk' + (p === cp ? ' cur' : ''));
        card.tabIndex = 0;
        card.setAttribute('role', 'button');
        var th = el('div', 'sr-mkth');
        th.style.height = Math.round(56 * ratio) + 'px';
        var info = el('div', 'sr-mki');
        info.appendChild(el('div', 'sr-mkn', (fa ? 'صفحه ' : 'Page ') + fnum(p)));
        var pct = Math.round(p / pages.length * 100);
        info.appendChild(el('div', 'sr-mks', fa ? fnum(pct) + '٪ از کتاب' : pct + '% of the book'));
        var mb = el('div', 'sr-mkbar'); var mbi = el('i'); mbi.style.width = pct + '%'; mb.appendChild(mbi); info.appendChild(mb);
        var rm = ibtn(IC.x); rm.className = 'sr-mkx'; rm.setAttribute('aria-label', fa ? 'حذف نشانک' : 'Remove bookmark');
        rm.onclick = function (e) { e.stopPropagation(); setMark(p, false); };
        card.appendChild(th); card.appendChild(info); card.appendChild(rm);
        function jump() { goTo(p); if (isCompact()) toggleSide(false); }
        card.onclick = jump;
        card.onkeydown = function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); jump(); } };
        paneM.appendChild(card);
        markThumbRender(th, p);
      });
    }

    function setZoom(z) {
      z = Math.max(ZMIN, Math.min(ZMAX, Math.round(z * 100) / 100));
      if (z === zoom || !pages.length) return;
      var idx = currentPage();
      var p0 = pages[idx];
      var frac = p0.wrap.offsetHeight ? (scroll.scrollTop - p0.wrap.offsetTop) / p0.wrap.offsetHeight : 0;
      zoom = z; zoomSet = true;
      savePrefs(); saveBookZoom();
      layout();
      scroll.scrollTop = p0.wrap.offsetTop + frac * p0.wrap.offsetHeight;
      rebuildObserve();
    }
    btnIn.onclick = function () { setZoom(zoom + 0.15); };
    btnOut.onclick = function () { setZoom(zoom - 0.15); };
    function showZoomLabel() { zl.value = Math.round(zoom * 100) + '%'; }
    function applyTypedZoom() {
      var t = String(zl.value || '').replace(/[۰-۹]/g, function (d) { return d.charCodeAt(0) - 1776; }).replace(/[٠-٩]/g, function (d) { return d.charCodeAt(0) - 1632; });
      var m = t.match(/\d+(?:[.,]\d+)?/);
      if (m) setZoom(parseFloat(m[0].replace(',', '.')) / 100);   // setZoom خودش بین ۵۰ تا ۳۰۰ نگه می‌دارد
      showZoomLabel();
    }
    zl.addEventListener('focus', function () { zl.value = String(Math.round(zoom * 100)); try { zl.select(); } catch (e) {} });
    zl.addEventListener('blur', applyTypedZoom);
    zl.addEventListener('keydown', function (e) {
      e.stopPropagation();
      if (e.key === 'Enter') { e.preventDefault(); zl.blur(); }
      else if (e.key === 'Escape') { e.preventDefault(); showZoomLabel(); zl.blur(); }
    });

    // ───── زوم با Ctrl + چرخ ماوس (و پینچ تاچ‌پد): فقط خودِ کتاب بزرگ/کوچک می‌شود، نه کل صفحه‌ی مرورگر ─────
    var wheelZ = 0, wheelX = 0, wheelY = 0, wheelRaf = 0;
    scroll.addEventListener('wheel', function (e) {
      if (destroyed || !(e.ctrlKey || e.metaKey)) return;
      e.preventDefault();                                   // جلوی زوم خودِ مرورگر
      if (!pages.length) return;
      var dy = e.deltaY * (e.deltaMode === 1 ? 33 : (e.deltaMode === 2 ? 400 : 1));
      if (!dy) return;
      if (!wheelZ) wheelZ = zoom;
      wheelZ = Math.max(ZMIN, Math.min(ZMAX, wheelZ * Math.exp(-Math.max(-120, Math.min(120, dy)) * 0.0025)));
      wheelX = e.clientX; wheelY = e.clientY;
      if (wheelRaf) return;
      wheelRaf = requestAnimationFrame(function () {         // چند چرخش پشت‌سرهم یک‌بار اعمال شوند
        wheelRaf = 0;
        if (destroyed) { wheelZ = 0; return; }
        var z = wheelZ; wheelZ = 0;
        zoomAt(z, wheelX, wheelY);
      });
    }, { passive: false });

    // ───── زوم با دو انگشت و دابل‌تپ (موبایل) ─────
    function pageAt(y) {
      var lo = 0, hi = pages.length - 1;
      while (lo < hi) {
        var mid = (lo + hi + 1) >> 1;
        if (pages[mid].wrap.offsetTop <= y) lo = mid; else hi = mid - 1;
      }
      return lo;
    }

    function zoomAt(z, cx, cy) {
      z = Math.max(ZMIN, Math.min(ZMAX, Math.round(z * 100) / 100));
      if (!pages.length || z === zoom) return;
      var r = scroll.getBoundingClientRect();
      var vx = cx - r.left, vy = cy - r.top;
      var px = scroll.scrollLeft + vx, py = scroll.scrollTop + vy;
      var p0 = pages[pageAt(py)];
      var fx = p0.wrap.offsetWidth ? (px - p0.wrap.offsetLeft) / p0.wrap.offsetWidth : 0.5;
      var fy = p0.wrap.offsetHeight ? (py - p0.wrap.offsetTop) / p0.wrap.offsetHeight : 0;
      zoom = z; zoomSet = true;
      savePrefs(); saveBookZoom();
      layout();
      scroll.scrollLeft = p0.wrap.offsetLeft + fx * p0.wrap.offsetWidth - vx;
      scroll.scrollTop = p0.wrap.offsetTop + fy * p0.wrap.offsetHeight - vy;
      rebuildObserve();
    }

    var pinch = null, tapStart = null, lastTap = null;
    function tDist(t) { var dx = t[0].clientX - t[1].clientX, dy = t[0].clientY - t[1].clientY; return Math.sqrt(dx * dx + dy * dy) || 1; }
    function pinchReset() {
      box.style.transform = ''; box.style.transformOrigin = ''; box.style.willChange = '';
    }
    function pinchEnd() {
      if (!pinch) return;
      var p = pinch; pinch = null;
      pinchReset();
      zl.value = Math.round(zoom * 100) + '%';
      if (Math.abs(p.z - zoom) > 0.02) zoomAt(p.z, p.cx, p.cy);
    }

    scroll.addEventListener('touchstart', function (e) {
      if (destroyed || !pages.length) return;
      if (e.touches.length === 2) {
        tapStart = null; lastTap = null; clearTimeout(tapTimer);
        var bx = box.getBoundingClientRect();
        var cx = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        var cy = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        pinch = { d0: tDist(e.touches), z0: zoom, z: zoom, cx: cx, cy: cy };
        box.style.transformOrigin = (cx - bx.left) + 'px ' + (cy - bx.top) + 'px';
        box.style.willChange = 'transform';
      } else if (e.touches.length === 1 && !pinch) {
        tapStart = { x: e.touches[0].clientX, y: e.touches[0].clientY, t: Date.now(), mv: (Date.now() - lastScrollAt) < 120 };
      }
    }, { passive: true });

    scroll.addEventListener('touchmove', function (e) {
      if (destroyed) return;
      if (pinch && e.touches.length === 2) {
        e.preventDefault();
        var nz = Math.max(ZMIN, Math.min(ZMAX, pinch.z0 * (tDist(e.touches) / pinch.d0)));
        pinch.z = nz;
        box.style.transform = 'scale(' + (nz / pinch.z0) + ')';
        zl.value = Math.round(nz * 100) + '%';
      } else if (tapStart && e.touches.length === 1) {
        var t = e.touches[0];
        if (Math.abs(t.clientX - tapStart.x) > 10 || Math.abs(t.clientY - tapStart.y) > 10) { tapStart = null; lastTap = null; }
      }
    }, { passive: false });

    scroll.addEventListener('touchend', function (e) {
      if (destroyed) return;
      if (pinch) { if (e.touches.length < 2) { tapStart = null; lastTap = null; pinchEnd(); } return; }
      if (tapStart && e.changedTouches.length === 1) {
        var now = Date.now();
        if (now - tapStart.t < 350) {
          if (lastTap && now - lastTap.t < 350 && Math.abs(lastTap.x - tapStart.x) < 30 && Math.abs(lastTap.y - tapStart.y) < 30) {
            lastTap = null; clearTimeout(tapTimer);
            zoomAt(zoom > 1.05 ? 1 : 2, tapStart.x, tapStart.y);
          } else {
            lastTap = { x: tapStart.x, y: tapStart.y, t: now };
            if (!tapStart.mv) scheduleBarTap(tapStart.y);   // تپ تکی (نه توقف اسکرول)
          }
        } else { lastTap = null; }
      }
      tapStart = null;
    }, { passive: true });

    scroll.addEventListener('touchcancel', function () {
      if (pinch) { pinch = null; pinchReset(); zl.value = Math.round(zoom * 100) + '%'; }
      tapStart = null; lastTap = null; clearTimeout(tapTimer);
    }, { passive: true });

    function rebuildObserve() {
      pages.forEach(function (p) { unrender(p); io.unobserve(p.wrap); io.observe(p.wrap); });
    }

    var rt = 0;
    function onResize() { clearTimeout(rt); rt = setTimeout(function () { if (destroyed) return; applyBarMode(); if (pages.length) { layout(); rebuildObserve(); } }, 200); }
    window.addEventListener('resize', onResize);
    applyBarMode();

    function showResume(n) {
      var t = el('div', 'sr-toast');
      t.appendChild(el('span', '', fa ? 'از صفحه ' + n + ' ادامه دادیم' : 'Continuing from page ' + n));
      var b = el('button', '', fa ? 'از اول' : 'From start');
      b.onclick = function () { goTo(1); if (t.parentNode) t.parentNode.removeChild(t); };
      t.appendChild(b);
      root.appendChild(t);
      setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 7000);
    }

    function fail(text) {
      msg.textContent = text;
      if (!msg.parentNode) box.appendChild(msg);
    }

    loadPdfjs().then(function (lib) {
      if (destroyed) return;
      return lib.getDocument({ data: new Uint8Array(o.data) }).promise;
    }).then(function (d) {
      if (destroyed || !d) return;
      doc = d;
      return d.getPage(1).then(function (p1) {
        if (destroyed) return;
        var v = p1.getViewport({ scale: 1 });
        var ratio = v.height / v.width;
        box.innerHTML = '';
        cnt.textContent = '/ ' + d.numPages;
        pg.max = d.numPages;
        for (var i = 0; i < d.numPages; i++) {
          var wrap = el('div', 'sr-page');
          var rib = el('div', 'sr-rib'); rib.appendChild(el('i')); wrap.appendChild(rib);
          wrap.dataset.i = i;
          box.appendChild(wrap);
          pages.push({ wrap: wrap, ratio: ratio, canvas: null, task: null, rendered: false, busy: false, token: 0 });
        }
        applyBarMode();
        layout();
        io = new IntersectionObserver(function (entries) {
          entries.forEach(function (en) {
            var i = Number(en.target.dataset.i);
            if (en.isIntersecting) render(pages[i], i); else unrender(pages[i]);
          });
        }, { root: scroll, rootMargin: '100% 0px 100% 0px' });
        pages.forEach(function (p) { io.observe(p.wrap); });
        loadMarks();
        (function () {
          var pr = loadPrefs();
          if (fitMode === 'fit' || fitMode === 'crop') { var m = fitMode; fitMode = 'normal'; setFit(m); }
          
        })();
        updateStar(0);
        updateProgress(0);
        var last = Number(o.startPage) > 0 ? Math.floor(Number(o.startPage)) : 1;
        if (!(Number(o.startPage) > 0)) { try { last = parseInt(localStorage.getItem(storeKey), 10) || 1; } catch (e) {} }
        if (last > 1 && last <= pages.length) { goTo(last); showResume(last); }
        if (!isCompact()) keyHint();
      });
    }).catch(function (err) {
      if (destroyed) return;
      fail(fa ? 'نمایش این کتاب ممکن نشد. صفحه را دوباره باز کنید.' : 'Could not display this book. Please try again.');
      if (window.console) console.error('SecureReader:', err);
    });

    function destroy() {
      if (destroyed) return;
      if (pages.length && o.onProgress && !destroyed) { try { o.onProgress(currentPage() + 1, pages.length); } catch (e) {} }
      destroyed = true;
      document.removeEventListener('keydown', onKey, true);
      window.removeEventListener('resize', onResize);
      if (io) io.disconnect();
      if (thumbIO) thumbIO.disconnect();
      clearTimeout(miniTimer);
      clearTimeout(srTimer);
      clearTimeout(tapTimer);
      idx = null;
      document.removeEventListener('pointerdown', outside, true);
      document.removeEventListener('pointerdown', outsideHelp, true);
      Object.keys(markCache).forEach(function (k) { try { markCache[k].width = 0; markCache[k].height = 0; } catch (e) {} });
      markCache = {};
      thumbs.forEach(function (t) { try { thumbUnrender(t); } catch (e) {} });
      thumbs = [];
      pages.forEach(function (p) { try { unrender(p); } catch (e) {} });
      pages = [];
      if (doc) { try { doc.destroy(); } catch (e) {} doc = null; }
      document.documentElement.classList.remove('sr-open');
      if (modalWin && modalWin.classList) modalWin.classList.remove('sr-full');
      host.innerHTML = '';
    }

    return { destroy: destroy };
  }

  window.SecureReader = { open: open, preload: preload };
})();
