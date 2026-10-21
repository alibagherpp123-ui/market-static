/*
 * تشخیص نوع PDF: «متنی» یا «اسکن‌شده» (فقط در پنل ادمین، موقع انتخاب فایل)
 * - فایل را تغییر نمی‌دهد و چیزی به متن تبدیل نمی‌کند؛ فقط چند صفحه‌ی نمونه را می‌خواند و برچسب می‌دهد.
 * - از PDF.js همین پوشه (pdf.js و pdf.worker.js) استفاده می‌کند؛ اگر نبود، پیام می‌دهد و ادمین دستی انتخاب می‌کند.
 * استفاده:  PdfKind.analyze(source, onProgress) → Promise<نتیجه>     (source: {url} یا {data})
 * نکته: بعد از هر تغییر این فایل، شماره‌ی ?v= را در admin.php بالا ببر (کش یک‌ساله).
 */
(function () {
  'use strict';

  var SAMPLE_PAGES = 16;      // حداکثر تعداد صفحه‌ی نمونه
  var MIN_IMG_AREA = 40000;   // عکس کوچک‌تر از این (پیکسل) «عکسِ صفحه» حساب نمی‌شود (لوگو، آیکون)
  var MAX_MS = 45000;         // سقف زمان بررسی؛ بعدش با همان صفحه‌های بررسی‌شده نتیجه می‌دهیم

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

  // ───────── شمارش حرف‌های قابل‌خواندن و مشکوک ─────────
  function isLetter(c) {
    return (c >= 0x41 && c <= 0x5a) || (c >= 0x61 && c <= 0x7a) ||            // لاتین ساده
      (c >= 0xc0 && c <= 0x24f && c !== 0xd7 && c !== 0xf7) ||                 // لاتین با نشانه (فرانسوی، آلمانی، …)
      (c >= 0x370 && c <= 0x52f) ||                                            // یونانی، سیریلیک
      (c >= 0x621 && c <= 0x64a) || (c >= 0x66e && c <= 0x6d3) || (c >= 0x6fa && c <= 0x6ff) ||   // عربی و فارسی
      (c >= 0x750 && c <= 0x77f) || (c >= 0xfb50 && c <= 0xfd3d) || (c >= 0xfd50 && c <= 0xfdff) || (c >= 0xfe70 && c <= 0xfefc) ||
      (c >= 0x3040 && c <= 0x9fff) || (c >= 0xac00 && c <= 0xd7af);            // ژاپنی، چینی، کره‌ای
  }
  function textStats(str) {
    var letters = 0, bad = 0, total = 0, latin1 = 0;
    for (var i = 0; i < str.length; i++) {
      var c = str.charCodeAt(i);
      if (c <= 32 || c === 0xa0 || (c >= 0x200b && c <= 0x200f) || c === 0x202a || c === 0x202b || c === 0x202c || c === 0xfeff) continue;
      total++;
      if (isLetter(c)) {
        letters++;
        if (c >= 0xc0 && c <= 0xff) latin1++;
      } else if (c === 0xfffd || (c >= 0xe000 && c <= 0xf8ff) || (c >= 0x80 && c <= 0x9f) || (c >= 0x2500 && c <= 0x25ff)) {
        bad++;   // مربع، علامت جایگزین، کاراکترهای ناشناخته
      }
    }
    return { letters: letters, bad: bad, total: total, latin1: latin1 };
  }

  // متن «خراب»: حرف‌ها وجود دارند ولی خوانا نیستند (مثلاً فارسی که با کدگذاری اشتباه استخراج شده)
  function isBrokenText(st) {
    var n = st.letters + st.bad;
    if (n < 40) return false;
    if (st.bad / n > 0.15) return true;
    if (st.letters > 0 && st.latin1 / st.letters > 0.4) return true;   // «ÇáÓáÇã» به جای حرف فارسی
    return false;
  }

  function imageArea(args) {
    var a = args || [];
    if (typeof a[1] === 'number' && typeof a[2] === 'number') return a[1] * a[2];
    var o = a[0];
    if (o && typeof o === 'object' && !Array.isArray(o) && o.width && o.height) return o.width * o.height;
    if (Array.isArray(o)) {
      var s = 0;
      for (var i = 0; i < o.length; i++) if (o[i] && o[i].width && o[i].height) s += o[i].width * o[i].height;
      return s || MIN_IMG_AREA;
    }
    return MIN_IMG_AREA;   // اندازه معلوم نیست؛ عکس حساب می‌کنیم
  }

  // انتخاب صفحه‌های نمونه: جلد و آخرین صفحه کنار گذاشته می‌شوند (حتی کتاب‌های متنی هم آن‌ها را عکس دارند)
  function pickPages(n) {
    var from = 1, to = n;
    if (n > 12) { from = 3; to = n - 1; }
    var count = to - from + 1;
    var k = Math.min(SAMPLE_PAGES, count);
    var out = [], seen = {};
    for (var i = 0; i < k; i++) {
      var p = from + (k === 1 ? 0 : Math.floor(i * (count - 1) / (k - 1)));
      if (!seen[p]) { seen[p] = 1; out.push(p); }
    }
    return out;
  }

  function classifyPage(page, lib) {
    var O = lib.OPS || {};
    var imgOps = {};
    ['paintImageXObject', 'paintInlineImageXObject', 'paintImageMaskXObject', 'paintJpegXObject', 'paintImageXObjectRepeat',
     'paintImageMaskXObjectRepeat', 'paintImageMaskXObjectGroup'].forEach(function (k) { if (typeof O[k] === 'number') imgOps[O[k]] = 1; });
    var trm = O.setTextRenderingMode;
    return new Promise(function (res) { res(Promise.all([page.getTextContent(), page.getOperatorList()])); }).then(function (r) {
      var str = r[0].items.map(function (it) { return it.str || ''; }).join(' ');
      var ol = r[1], area = 0, invisible = false;
      for (var i = 0; i < ol.fnArray.length; i++) {
        var fn = ol.fnArray[i];
        if (imgOps[fn]) area += imageArea(ol.argsArray[i]);
        else if (typeof trm === 'number' && fn === trm && ol.argsArray[i] && ol.argsArray[i][0] === 3) invisible = true;
      }
      var st = textStats(str);
      var n = st.letters + st.bad;
      var cls;
      if (n >= 60) cls = isBrokenText(st) ? 'broken' : 'text';
      else if (n < 25 && area >= MIN_IMG_AREA) cls = 'scan';
      else if (n < 25) cls = 'blank';
      else cls = 'unclear';
      return { cls: cls, ocr: cls === 'text' && invisible && area >= MIN_IMG_AREA };
    });
  }

  function verdict(c, totalPages) {
    var counted = c.text + c.scan + c.broken;
    if (!counted || counted < Math.min(3, totalPages)) return 'unknown';   // شواهد کافی نیست (مثلاً بیشتر صفحه‌ها خالی‌اند)
    if (c.broken / counted >= 0.5) return 'broken';
    if (c.text / counted >= 0.8) return 'text';
    if (c.scan / counted >= 0.8) return 'scan';
    return 'mixed';
  }

  // source: {url:...} یا {data: ArrayBuffer}
  function analyze(source, onProgress) {
    var t0 = Date.now();
    var lib, doc;
    return loadPdfjs().then(function (l) {
      lib = l;
      var task = lib.getDocument(source);
      return task.promise;
    }).then(function (d) {
      doc = d;
      var pages = pickPages(doc.numPages);
      var c = { text: 0, scan: 0, broken: 0, blank: 0, unclear: 0 }, ocr = 0, done = 0;
      function next(i) {
        if (i >= pages.length || Date.now() - t0 > MAX_MS) return Promise.resolve();
        return doc.getPage(pages[i]).then(function (pg) {
          return classifyPage(pg, lib).then(function (r) {
            c[r.cls]++; if (r.ocr) ocr++;
            done++; if (onProgress) { try { onProgress(done, pages.length); } catch (e) {} }
            try { pg.cleanup(); } catch (e) {}
          }, function () { c.unclear++; done++; });
        }).then(function () { return next(i + 1); });
      }
      return next(0).then(function () {
        var res = { v: 1, kind: verdict(c, doc.numPages), total: doc.numPages, sampled: done, text: c.text, scan: c.scan, broken: c.broken, blank: c.blank, unclear: c.unclear, ocr: c.text > 0 && ocr / c.text >= 0.5, ms: Date.now() - t0 };
        try { doc.destroy(); } catch (e) {}
        return res;
      });
    });
  }

  // ───────── بخش نمایش در فرم کتاب ─────────
  var LABEL = { text: 'متنی', scan: 'اسکن‌شده', mixed: 'ترکیبی (بعضی صفحه‌ها متن، بعضی اسکن)', broken: 'متن خراب (قابل خواندن نیست)', unknown: 'نامشخص' };
  var NOTE_ON = 'امکانات ویژه‌ی کتاب‌های متنی (مثل جستجو) برای این کتاب فعال می‌شود.';
  var NOTE_OFF = 'امکانات ویژه‌ی کتاب‌های متنی برای این کتاب نمایش داده نمی‌شود.';

  function fa(n) { return String(n).replace(/\d/g, function (d) { return '۰۱۲۳۴۵۶۷۸۹'.charAt(Number(d)); }); }

  function describe(r) {
    if (!r || r.kind === 'unknown') return 'نوع PDF تشخیص داده نشد. اگه می‌خوای، دستی انتخاب کن.';
    var s = 'تشخیص خودکار: ' + LABEL[r.kind] + ' — از ' + fa(r.sampled) + ' صفحه‌ی نمونه، ' + fa(r.text) + ' متنی، ' + fa(r.scan) + ' اسکن' + (r.broken ? '، ' + fa(r.broken) + ' با متن خراب' : '') + '.';
    if (r.kind === 'text' && r.ocr) s += ' (به‌نظر اسکنی است که قبلاً OCR شده؛ جستجو کار می‌کند ولی دقتش به کیفیت OCR بستگی دارد.)';
    return s;
  }

  function injectStyle() {
    if (document.getElementById('pk-style')) return;
    var st = document.createElement('style');
    st.id = 'pk-style';
    st.textContent =
      '.pdfkind{margin:10px 0 14px;padding:12px 14px;border:1px solid var(--b,#d0d0d0);border-radius:12px}' +
      '.pdfkind .pk-t{font-weight:600;margin-bottom:6px}' +
      '.pdfkind .pk-badge{display:inline-block;padding:2px 10px;border-radius:999px;font-size:.82rem;margin-inline-start:6px;background:rgba(128,128,128,.18)}' +
      '.pdfkind .pk-badge.text{background:rgba(31,157,87,.18);color:#17803d}.pdfkind .pk-badge.scan,.pdfkind .pk-badge.mixed{background:rgba(180,83,9,.16);color:#b45309}.pdfkind .pk-badge.broken{background:rgba(217,45,32,.16);color:#d92d20}' +
      '.pdfkind .pk-s{font-size:.84rem;color:var(--m,#666);line-height:1.9;margin:4px 0}' +
      '.pdfkind .pk-s.err{color:#d92d20}' +
      '.pdfkind .pk-bar{display:none;height:6px;border-radius:5px;background:rgba(128,128,128,.25);overflow:hidden;margin:6px 0}.pdfkind .pk-bar.on{display:block}' +
      '.pdfkind .pk-bar i{display:block;height:100%;width:0;background:var(--p,#2f6fdd);transition:width .15s}' +
      '.pdfkind .pk-row{display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin-top:8px}.pdfkind .pk-row label{margin:0;font-weight:400;font-size:.86rem}' +
      '.pdfkind select{min-width:190px}';
    document.head.appendChild(st);
  }

  function bind(box) {
    if (box.__pk) return;
    box.__pk = true;
    var form = box.form || box.closest('form');
    if (!form) return;
    var cur = { kind: box.getAttribute('data-kind') || '', by: box.getAttribute('data-by') || '' };
    var bookId = box.getAttribute('data-book') || '';
    var elBadge = box.querySelector('.pk-badge'), elStat = box.querySelector('.pk-s'), elNote = box.querySelector('.pk-note');
    var elBar = box.querySelector('.pk-bar'), elBarI = elBar && elBar.querySelector('i');
    var pick = box.querySelector('select[name="pdf_kind_pick"]'), hid = box.querySelector('input[name="pdf_kind_auto"]');
    var recheck = box.querySelector('.pk-recheck');
    var last = null, seq = 0, objUrl = '';

    function effective() {
      if (pick && pick.value) return pick.value;
      if (last) return last.kind;
      return cur.kind;
    }
    function paint() {
      var k = effective();
      if (elBadge) { elBadge.textContent = k ? LABEL[k] || k : 'بررسی نشده'; elBadge.className = 'pk-badge ' + (k || ''); }
      if (elNote) elNote.textContent = k ? (k === 'text' ? NOTE_ON : NOTE_OFF) : 'تا وقتی نوع PDF مشخص نشود، امکانات ویژه‌ی کتاب‌های متنی نمایش داده نمی‌شود.';
    }
    function busy(on, pct) {
      if (elBar) { elBar.className = 'pk-bar' + (on ? ' on' : ''); if (elBarI) elBarI.style.width = (pct || 0) + '%'; }
    }
    function run(source, label, cleanup) {
      var my = ++seq;
      last = null; if (hid) hid.value = '';
      if (elStat) { elStat.className = 'pk-s'; elStat.textContent = label + ' در حال بررسی نوع PDF…'; }
      busy(true, 0); paint();
      analyze(source, function (d, t) { if (my === seq) busy(true, Math.round(d * 100 / t)); }).then(function (r) {
        if (cleanup) cleanup();
        if (my !== seq) return;
        last = r; if (hid) hid.value = JSON.stringify(r);
        busy(false);
        if (elStat) { elStat.className = 'pk-s'; elStat.textContent = describe(r); }
        paint();
      }, function (err) {
        if (cleanup) cleanup();
        if (my !== seq) return;
        busy(false);
        if (window.console) console.error('PdfKind:', err);
        var miss = err && /pdfjs/.test(String(err.message || ''));
        if (elStat) { elStat.className = 'pk-s err'; elStat.textContent = miss ? 'فایل‌های PDF.js پیدا نشد (assets/pdfjs/pdf.js)؛ تشخیص خودکار انجام نشد. نوع PDF را دستی انتخاب کن.' : 'این PDF برای تشخیص خودکار باز نشد. نوع PDF را دستی انتخاب کن.'; }
        paint();
      });
    }

    var inp = form.querySelector('input[type=file][accept*="pdf"]');
    if (inp) inp.addEventListener('change', function () {
      var f = inp.files && inp.files[0];
      if (!f) { seq++; last = null; if (hid) hid.value = ''; busy(false); if (elStat) elStat.textContent = ''; paint(); return; }
      if (objUrl) { try { URL.revokeObjectURL(objUrl); } catch (e) {} }
      objUrl = URL.createObjectURL(f);
      var u = objUrl;
      run({ url: u }, f.name, function () { try { URL.revokeObjectURL(u); } catch (e) {} if (objUrl === u) objUrl = ''; });
    });
    if (recheck) recheck.addEventListener('click', function () {
      if (elStat) { elStat.className = 'pk-s'; elStat.textContent = 'در حال گرفتن فایل فعلی…'; }
      fetch('admin.php?a=pdf_get&id=' + encodeURIComponent(bookId), { credentials: 'same-origin' }).then(function (res) {
        if (!res.ok) throw new Error('http');
        return res.arrayBuffer();
      }).then(function (buf) {
        run({ data: new Uint8Array(buf) }, 'فایل فعلی —');
      }, function () {
        if (elStat) { elStat.className = 'pk-s err'; elStat.textContent = 'گرفتن فایل فعلی ممکن نشد. صفحه را دوباره باز کن.'; }
      });
    });
    if (pick) pick.addEventListener('change', paint);
    paint();
  }

  function init() {
    injectStyle();
    Array.prototype.forEach.call(document.querySelectorAll('.pdfkind'), bind);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();

  window.PdfKind = { analyze: analyze, bind: bind, pickPages: pickPages, _textStats: textStats };
})();
