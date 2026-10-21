<?php
// بررسی چندمرحله‌ای PDF قبل از ذخیره.
// هر تابع '' برمی‌گرداند اگر مشکلی نبود، و در غیر این صورت متن خطا (فارسی).
//   قدم ۱: سربرگ (%PDF-) و انتهای فایل (startxref و %%EOF)
//   قدم ۲: عدد startxref باید به جدول مرجع واقعی اشاره کند
//   قدم ۳: اسکن کل فایل (کد PHP، بسته بودن stream، برابری obj/endobj، وجود /Root)
//   قدم ۴: باز کردن تک‌تک streamهای فشرده (FlateDecode) برای پیدا کردن خرابی وسط فایل + بررسی اختیاری qpdf

if (!defined('PDF_DEEP_SECONDS')) define('PDF_DEEP_SECONDS', 60);   // حداکثر زمان بررسی عمیق قدم ۴ (ثانیه)؛ بعد از آن بقیه‌ی streamها چک نمی‌شوند
if (!defined('PDF_USE_QPDF')) define('PDF_USE_QPDF', true);     // اگر روی هاست qpdf نصب باشد و exec بسته نباشد، استفاده می‌شود؛ وگرنه خودکار رد می‌شود
if (!defined('PDF_SCAN_CHUNK')) define('PDF_SCAN_CHUNK', 4 * 1048576);   // قابل تنظیم از بیرون برای تست مرز تکه‌ها (حداقل ۵۰۰)

// ───────── قدم ۱ ─────────
// سربرگ: %PDF-1.x یا %PDF-2.0 باید در ۱ کیلوبایت اول باشد (همان تحملی که Acrobat دارد).
function pdf_check_header($head) {
    if (!preg_match('/%PDF-(?:1\.[0-7]|2\.0)/', $head))
        return 'سربرگ PDF (%PDF-) پیدا نشد؛ این فایل PDF نیست.';
    return '';
}

// جای شروع سربرگ (برای PDFهایی که چند بایت اضافه قبل از %PDF- دارند؛ آدرس‌های داخل فایل از همین نقطه حساب می‌شوند)
function pdf_header_pos($head) {
    return preg_match('/%PDF-/', $head, $m, PREG_OFFSET_CAPTURE) ? (int)$m[0][1] : 0;
}

// انتهای فایل: PDF کامل‌شده در ۲ کیلوبایت آخرش startxref و %%EOF دارد.
// اگر آپلود نیمه‌کاره مانده باشد یا فایل بریده شده باشد، این‌ها معمولاً نیستند.
function pdf_check_trailer($tail) {
    if (strpos($tail, '%%EOF') === false)
        return 'انتهای فایل (%%EOF) پیدا نشد؛ فایل احتمالاً ناقص آپلود یا بریده شده است.';
    if (!preg_match('/startxref\s+\d+\s+%%EOF/', $tail))
        return 'جدول مرجع انتهای فایل (startxref) پیدا نشد؛ فایل ناقص یا خراب است.';
    return '';
}

// ───────── قدم ۲ ─────────
// عددی که بعد از startxref آمده باید به جدول مرجع واقعی اشاره کند:
// یا کلمه‌ی xref (جدول کلاسیک) یا «N G obj» (جدول فشرده‌ی PDF جدید).
function pdf_check_xref($fh, $size, $tail, $hdrPos) {
    if (!preg_match_all('/startxref\s+(\d+)/', $tail, $mm) || !count($mm[1])) return 'عدد startxref خوانده نشد.';
    $off = (float)end($mm[1]);
    if ($off <= 0 || $off >= $size) return 'آدرس جدول مرجع (startxref) خارج از فایل است؛ فایل خراب است.';
    $shifts = $hdrPos > 0 ? array(0, $hdrPos) : array(0);   // آدرس دقیق، یا آدرس + بایت‌های اضافه‌ی ابتدای فایل
    foreach ($shifts as $shift) {
        $pos = (int)$off + $shift;
        if ($pos >= $size) continue;
        $from = max(0, $pos - 16);                           // تحمل ±۱۶ بایت: بعضی PDFهای سالم کمی جابه‌جا هستند
        fseek($fh, $from);
        $buf = (string)fread($fh, 96);
        if (preg_match('/(?:^|[\r\n\s])xref\s|(?:^|[\r\n\s])\d+\s+\d+\s+obj\b/', $buf)) return '';
    }
    return 'startxref به جدول مرجع واقعی اشاره نمی‌کند؛ ساختار داخلی فایل خراب است.';
}

// ───────── قدم ۳ ─────────
// اسکن کل فایل، تکه‌تکه (هر بار ۴ مگابایت). بین stream و endstream «داده‌ی خام» است و کلمه‌های ساختاری آن‌جا شمرده نمی‌شوند.
// $info در خروجی: pairs = جای streamهای بیرونی [شروع، پایان]، enc = فایل رمزگذاری‌شده است یا نه.
function pdf_scan_full($fh, $size, &$info) {
    $info = array('pairs' => array(), 'enc' => false);
    $CTX = 64; $MARGIN = 64;   // CTX: بایت‌های قبلِ هر تکه برای دیدن کلمه‌های نصفه؛ MARGIN: بایت‌های آخر تکه که به نوبت بعد می‌روند
    $re = '/endstream|endobj|stream(?=\r?\n)|(?<![A-Za-z])obj(?![A-Za-z])|(?i:<\?php|<\?=)|\/Root\s+\d+\s+\d+\s+R|\/Encrypt\b/';
    $depth = 0; $objs = 0; $endobjs = 0; $root = false; $cur = 0;   // depth: عمق stream (یک PDF می‌تواند PDF دیگری را بدون فشرده‌سازی داخل خودش داشته باشد)
    $carry = ''; $first = true; $consumed = 0;
    rewind($fh);
    while (true) {
        $chunk = (string)fread($fh, PDF_SCAN_CHUNK);
        $last = feof($fh) || $chunk === '';
        $base = $consumed - strlen($carry);                 // جای بایت صفرِ $buf در فایل
        $consumed += strlen($chunk);
        $buf = $carry . $chunk;
        $len = strlen($buf);
        $lo  = $first ? 0 : $CTX;
        $cut = $last ? $len : max($lo, $len - $MARGIN);
        $n = preg_match_all($re, $buf, $m, PREG_OFFSET_CAPTURE);
        if ($n === false) return 'اسکن کامل فایل ممکن نشد (خطای پردازش).';
        foreach ($m[0] as $hit) {
            $tok = $hit[0]; $at = $hit[1];
            if ($at < $lo || $at >= $cut) continue;
            if ($tok === 'stream') { if ($depth === 0) $cur = $base + $at; $depth++; continue; }
            if ($tok === 'endstream') {
                if ($depth < 1) return 'endstream بدون stream پیدا شد؛ ساختار فایل خراب است.';
                $depth--;
                if ($depth === 0) $info['pairs'][] = array($cur, $base + $at);
                continue;
            }
            if ($depth > 0) continue;                       // داخل داده‌ی خام چیزی بررسی نمی‌شود
            if ($tok === 'endobj') { $endobjs++; continue; }
            if ($tok === 'obj')    { $objs++; continue; }
            if ($tok[0] === '<')   return 'داخل ساختار فایل کد PHP پیدا شد؛ فایل رد شد.';
            if ($tok[1] === 'E')   { $info['enc'] = true; continue; }   // /Encrypt
            $root = true;                                   // /Root N G R
        }
        if ($last) break;
        $carry = substr($buf, max(0, $cut - $CTX));
        $first = false;
    }
    if ($depth > 0) return 'یک stream تا آخر فایل بسته نشده؛ فایل بریده یا خراب است.';
    if ($objs < 1) return 'هیچ شیء (obj) داخل فایل پیدا نشد؛ PDF واقعی نیست.';
    if ($objs !== $endobjs) return 'تعداد obj و endobj برابر نیست (' . $objs . ' و ' . $endobjs . ')؛ بخشی از فایل گم یا خراب شده.';
    if (!$root) return 'ارجاع /Root (ریشه‌ی سند) در فایل نیست؛ این PDF سند کامل نیست.';
    return '';
}

// ───────── قدم ۴-الف ─────────
// هر stream که فیلتر اولش FlateDecode است را کامل باز می‌کند (تکه‌های ۱۶ کیلوبایتی، پس حافظه‌ی زیادی نمی‌گیرد).
// خرابی وسط عکس یا صفحه‌ی فشرده همین‌جا پیدا می‌شود. فایل رمزگذاری‌شده بررسی نمی‌شود (داده‌اش رمز است، نه فشرده‌ی ساده).
function pdf_check_streams($fh, $info, $deadline) {
    if ($info['enc'] || !function_exists('inflate_init') || !function_exists('inflate_get_status')) return '';
    foreach ($info['pairs'] as $pr) {
        if (time() > $deadline) return '';                  // وقت تمام شد؛ بقیه چک نمی‌شوند (قدم‌های ۱ تا ۳ قبلاً گذرانده شده)
        $s = $pr[0]; $e = $pr[1];
        $from = max(0, $s - 4096);
        fseek($fh, $from);
        $ctx = (string)fread($fh, $s - $from + 8);
        $pre = substr($ctx, 0, $s - $from);
        $p = strrpos($pre, 'obj');
        $dict = $p === false ? $pre : substr($pre, $p);
        if (!preg_match('/\/Filter\s*\[?\s*\/FlateDecode\b/', $dict)) continue;   // فقط فیلتر اول Flate باشد
        $ds = $s + 6 + (substr($ctx, $s - $from + 6, 2) === "\r\n" ? 2 : 1);      // بعد از «stream» و خط جدید
        $left = $e - $ds;
        if ($left < 1) continue;
        $objNo = preg_match_all('/(\d+)\s+\d+\s+obj\b/', $pre, $mo) ? end($mo[1]) : '؟';   // شماره‌ی شیء از «N G obj» درست قبل از stream
        $z = inflate_init(ZLIB_ENCODING_DEFLATE);
        fseek($fh, $ds);
        $ended = false;
        while ($left > 0) {
            $d = fread($fh, min(16384, $left));
            if ($d === false || $d === '') break;
            $left -= strlen($d);
            $out = @inflate_add($z, $d, ZLIB_NO_FLUSH);
            if ($out === false) return 'محتوای فشرده‌ی شیء شماره‌ی ' . $objNo . ' خراب است (فایل از وسط آسیب دیده).';
            if (inflate_get_status($z) === ZLIB_STREAM_END) { $ended = true; break; }
        }
        if (!$ended) return 'محتوای فشرده‌ی شیء شماره‌ی ' . $objNo . ' ناقص است (فایل بریده یا آسیب‌دیده).';
    }
    return '';
}

// ───────── قدم ۴-ب (اختیاری) ─────────
// اگر qpdf روی سرور باشد و exec بسته نباشد، بررسی کامل‌تر انجام می‌دهد. کد خروج ۲ یعنی خطای جدی؛ ۳ یعنی فقط هشدار (قبول).
function pdf_check_qpdf($path, $info) {
    if (!PDF_USE_QPDF || $info['enc'] || !function_exists('exec')) return '';
    $dis = array_map('trim', explode(',', (string)ini_get('disable_functions')));
    if (in_array('exec', $dis, true)) return '';
    $bin = '';
    foreach (array('/usr/bin/qpdf', '/usr/local/bin/qpdf', '/bin/qpdf') as $c) { if (@is_executable($c)) { $bin = $c; break; } }
    if ($bin === '') return '';
    $out = array(); $rc = 0;
    @exec(escapeshellarg($bin) . ' --check ' . escapeshellarg($path) . ' 2>&1', $out, $rc);
    if ($rc === 2) return 'بررسی کامل فایل (qpdf) خطای جدی در ساختار PDF پیدا کرد.';
    return '';
}

// ───────── نقطه‌ی ورود ─────────
// مسیر فایل موقت و حجمش را می‌گیرد. '' = سالم، غیر از آن = متن خطا.
function pdf_check_file($path, $size) {
    $size = (int)$size;
    if ($size < 60) return 'فایل خیلی کوچک است و PDF معتبر نیست.';
    $fh = @fopen($path, 'rb');
    if (!$fh) return 'خواندن فایل آپلودشده ممکن نشد.';
    $head = fread($fh, 1024);
    $tailLen = min(2048, $size);
    fseek($fh, -$tailLen, SEEK_END);
    $tail = fread($fh, $tailLen);
    $info = array('pairs' => array(), 'enc' => false);

    $e = pdf_check_header($head);
    if ($e === '') $e = pdf_check_trailer($tail);
    if ($e === '') $e = pdf_check_xref($fh, $size, $tail, pdf_header_pos($head));
    if ($e === '') $e = pdf_scan_full($fh, $size, $info);
    if ($e === '') $e = pdf_check_streams($fh, $info, time() + PDF_DEEP_SECONDS);
    fclose($fh);
    if ($e === '') $e = pdf_check_qpdf($path, $info);
    return $e;
}
