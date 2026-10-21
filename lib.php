<?php
// ============================================================
// توابع مشترک: خوندن اطلاعات از پوشه‌ی data و ساختن صفحه
// این فایل خودش چیزی نمایش نمی‌ده؛ فقط توسط author.php و sitemap.php استفاده می‌شه.
// ============================================================

// امن‌کردن متن برای قرار گرفتن توی HTML
function e($s) {
    return htmlspecialchars((string)$s, ENT_QUOTES, 'UTF-8');
}

// ---------- بیوگرافی چندپاراگرافی و پرسش‌های متداول ----------
// قاعده: خط خالی = پاراگراف جدید؛ خطی که با ## شروع شود = زیرعنوان. بقیه‌ی متن همیشه escape می‌شود.
function bio_blocks($bio) {
    $bio = str_replace(array("\r\n", "\r"), "\n", (string)$bio);
    $parts = preg_split('/\n\s*\n/u', trim($bio));
    $out = array();
    if (!is_array($parts)) return $out;
    foreach ($parts as $part) {
        $buf = array();
        foreach (explode("\n", $part) as $line) {
            $line = trim($line);
            if ($line === '') continue;
            if (preg_match('/^##\s*(.+)$/u', $line, $m)) {
                if ($buf) { $out[] = array('p', implode(' ', $buf)); $buf = array(); }
                $out[] = array('h', trim($m[1]));
            } else {
                $buf[] = $line;
            }
        }
        if ($buf) $out[] = array('p', implode(' ', $buf));
    }
    return $out;
}

function bio_to_html($bio) {
    $html = '';
    foreach (bio_blocks($bio) as $b) {
        if ($b[0] === 'h') $html .= '<h2 class="author-bio-heading">' . e($b[1]) . '</h2>';
        else $html .= '<p>' . e($b[1]) . '</p>';
    }
    return $html;
}

// متن ساده‌ی بیوگرافی (برای داده‌ی ساختاریافته‌ی JSON-LD): بدون علامت ## و بدون زیرعنوان
function bio_to_plain($bio) {
    $t = array();
    foreach (bio_blocks($bio) as $b) { if ($b[0] === 'p') $t[] = $b[1]; }
    return implode(' ', $t);
}

// بخش پرسش‌های متداول؛ $items = آرایه‌ای از array('q' => ..., 'a' => ...)
function faq_to_html($items, $heading) {
    if (!is_array($items)) return '';
    $html = '';
    foreach ($items as $it) {
        if (!is_array($it) || empty($it['q']) || empty($it['a'])) continue;
        $html .= '<details class="author-faq-item"><summary>' . e($it['q']) . '</summary>'
              . '<div class="author-faq-answer">' . bio_to_html($it['a']) . '</div></details>';
    }
    if ($html === '') return '';
    return '<section class="author-faq" id="authorFaq"><h2 class="author-faq-heading">' . e($heading) . '</h2>' . $html . '</section>';
}

// ---------- صفحه‌ی مستقل هر کتاب ----------
// آدرس: book-<شماره>-<اسم-انگلیسی>.html (فارسی) و en-book-<شماره>-<اسم-انگلیسی>.html (انگلیسی).
// «شماره‌ی کتاب» کلید اصلیه؛ اگه اسم کتاب عوض بشه، آدرس قدیمی خودکار (301) به آدرس درست می‌ره.
// کتابی که متن (توضیح + معرفی) کمتر از این تعداد حرف داشته باشه «کم‌محتوا» حساب می‌شه و noindex می‌گیره و در sitemap نمی‌آد.
function book_min_text_chars() { return 350; }

function book_slug($b) {
    // اگه ادمین برای این کتاب آدرس دلخواه (slug) گذاشته باشه همون استفاده می‌شه، وگرنه از اسم انگلیسی ساخته می‌شه
    if (!empty($b['slug']) && is_string($b['slug'])) {
        $c = trim(preg_replace('/[^a-z0-9]+/', '-', strtolower($b['slug'])), '-');
        if ($c !== '') return strlen($c) > 60 ? trim(substr($c, 0, 60), '-') : $c;
    }
    $t = isset($b['title']['en']) ? (string)$b['title']['en'] : '';
    $t = strtolower(str_replace(array("'", "’", "‘"), '', $t));
    $t = trim(preg_replace('/[^a-z0-9]+/', '-', $t), '-');
    // اگه اسم انگلیسی نداده باشن، از روی اسم فارسی به حروف انگلیسی تبدیل می‌شه
    if ($t === '') $t = persian_to_slug(isset($b['title']['fa']) ? (string)$b['title']['fa'] : '');
    if (strlen($t) > 60) $t = trim(substr($t, 0, 60), '-');
    return $t;
}
// تبدیل ساده‌ی حروف فارسی به انگلیسی برای ساختن آدرس (مثلاً «برادران کارامازوف» → braderan-karamazof)
function persian_to_slug($s) {
    $map = array('ا'=>'a','آ'=>'a','أ'=>'a','إ'=>'e','ب'=>'b','پ'=>'p','ت'=>'t','ث'=>'s','ج'=>'j','چ'=>'ch','ح'=>'h','خ'=>'kh','د'=>'d','ذ'=>'z','ر'=>'r','ز'=>'z','ژ'=>'zh','س'=>'s','ش'=>'sh','ص'=>'s','ض'=>'z','ط'=>'t','ظ'=>'z','ع'=>'','غ'=>'gh','ف'=>'f','ق'=>'gh','ک'=>'k','ك'=>'k','گ'=>'g','ل'=>'l','م'=>'m','ن'=>'n','ه'=>'h','ة'=>'h','ی'=>'y','ي'=>'y','ئ'=>'','ء'=>'','ؤ'=>'v');
    $s = strtr((string)$s, array('۰'=>'0','۱'=>'1','۲'=>'2','۳'=>'3','۴'=>'4','۵'=>'5','۶'=>'6','۷'=>'7','۸'=>'8','۹'=>'9','٠'=>'0','١'=>'1','٢'=>'2','٣'=>'3','٤'=>'4','٥'=>'5','٦'=>'6','٧'=>'7','٨'=>'8','٩'=>'9'));
    $chars = preg_split('//u', $s, -1, PREG_SPLIT_NO_EMPTY);
    if (!is_array($chars)) return '';
    $out = ''; $n = count($chars);
    for ($i = 0; $i < $n; $i++) {
        $c = $chars[$i];
        if ($c === 'و') {
            // «و» بین دو حرف صدادار نیست → معمولاً o (مثل «دوست» → dost)؛ در بقیه جاها v
            $prev = $i > 0 ? $chars[$i - 1] : '';
            $next = $i + 1 < $n ? $chars[$i + 1] : '';
            $prevCons = ($prev !== '' && isset($map[$prev]) && !in_array($prev, array('ا','آ','ی','ي'), true));
            $nextLetter = ($next !== '' && isset($map[$next]));
            $alone = (($prev === '' || $prev === ' ') && ($next === '' || $next === ' '));
            $out .= $alone ? 'va' : (($prevCons && ($nextLetter || $next === '' || !isset($map[$next]))) ? 'o' : 'v');
        } elseif (isset($map[$c])) {
            $out .= $map[$c];
        } elseif (preg_match('/^[A-Za-z0-9]$/', $c)) {
            $out .= strtolower($c);
        } else {
            $out .= '-';
        }
    }
    return trim(preg_replace('/[^a-z0-9]+/', '-', $out), '-');
}
function book_id_clean($b) {
    return preg_replace('/[^a-z0-9]/', '', strtolower(isset($b['id']) ? (string)$b['id'] : ''));
}
function book_page_file($b, $lang = 'fa') {
    $slug = book_slug($b);
    return ($lang === 'en' ? 'en-book-' : 'book-') . book_id_clean($b) . ($slug !== '' ? '-' . $slug : '') . '.html';
}
function book_page_url($base, $b, $lang = 'fa') {
    return $base . '/' . book_page_file($b, $lang);
}
function author_page_file($slug, $lang = 'fa') {
    return ($lang === 'en' ? 'en-author-' : 'author-') . $slug . '.html';
}
function text_len($s) {
    $s = (string)$s;
    return function_exists('mb_strlen') ? mb_strlen($s, 'UTF-8') : strlen($s);
}
// متن این کتاب به زبان مورد نظر «واقعی» است؟ (عنوان و معرفی پر، و فارسی/انگلیسی واقعی؛ نه خالی و نه کپی زبان دیگر)
function book_text_ready($b, $lang) {
    if (!is_array($b) || book_id_clean($b) === '' || empty($b['authorId'])) return false;
    foreach (array('title', 'bio') as $k) {
        $v = isset($b[$k][$lang]) ? trim((string)$b[$k][$lang]) : '';
        if ($v === '') return false;
        if ($lang === 'fa' && !has_arabic_script($v)) return false;
        if ($lang === 'en' && has_arabic_script($v)) return false;
    }
    return true;
}
// آیا صفحه‌ی این کتاب باید در گوگل بیاد؟ متن واقعی + حداقل حجم محتوا
function book_indexable($b, $lang) {
    if (!book_text_ready($b, $lang)) return false;
    $d = isset($b['desc'][$lang]) ? trim((string)$b['desc'][$lang]) : '';
    return text_len($d . trim((string)$b['bio'][$lang])) >= book_min_text_chars();
}
function find_author_by_id($authors, $id) {
    foreach ($authors as $a) {
        if (is_array($a) && isset($a['id']) && (string)$a['id'] === (string)$id) return $a;
    }
    return null;
}
function cut_text($s, $max) {
    $s = trim(preg_replace('/\s+/u', ' ', (string)$s));
    if (text_len($s) <= $max) return $s;
    $cut = function_exists('mb_substr') ? mb_substr($s, 0, $max - 1, 'UTF-8') : substr($s, 0, $max - 1);
    return rtrim($cut, " ,.،؛;:") . '…';
}

// فهرست عمومی کتاب‌ها برای جاوااسکریپت صفحه (نام فایل PDF روی سرور بیرون نمی‌رود؛ فقط hasPdf)
function books_public_json($booksData) {
    $pub = $booksData;
    foreach ($pub as $k => $bk) {
        if (is_array($bk)) {
            $pub[$k]['cover'] = book_cover_public($bk);
            $pub[$k]['hasPdf'] = !empty($bk['pdf']['file']);
            $pub[$k]['pdfKind'] = (!empty($bk['pdf']['file']) && isset($bk['pdf']['kind']) && is_string($bk['pdf']['kind'])) ? $bk['pdf']['kind'] : '';
            unset($pub[$k]['pdf']);
        }
    }
    return json_for_script(json_encode($pub, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG));
}
// تصویر جلد کتاب (اختیاری): فایل images/books/<شماره‌ی کتاب>.jpg (یا jpeg / png / webp). اگه نبود، صفحه یه جلد طراحی‌شده می‌سازه.
function book_cover_rel($b) {
    $id = book_id_clean($b);
    if ($id === '') return '';
    foreach (array('webp', 'jpg', 'jpeg', 'png') as $ext) {
        $rel = 'images/books/' . $id . '.' . $ext;
        if (is_file(__DIR__ . '/' . $rel)) return $rel;
    }
    return '';
}

// آدرس عمومی جلد کتاب برای جاوااسکریپت (با نسخه‌ی فایل تا بعد از تعویض عکس، کش مرورگر قدیمی را نشان ندهد). اگه جلد نداشت: رشته‌ی خالی
function book_cover_public($b) {
    $rel = book_cover_rel($b);
    if ($rel === '') return '';
    return $rel . '?v=' . (int)@filemtime(__DIR__ . '/' . $rel);
}

// صفحه‌ی خطای ساده (فارسی) و توقف
function fail_page($code, $title, $message) {
    http_response_code($code);
    header('Content-Type: text/html; charset=utf-8');
    header('X-Robots-Tag: noindex, nofollow');   // صفحه‌ی خطا/پیدا نشد در نتایج گوگل نیاد
    echo '<!DOCTYPE html><html lang="fa" dir="rtl"><head><meta charset="utf-8">';
    echo '<meta name="robots" content="noindex,nofollow">';
    echo '<meta name="viewport" content="width=device-width, initial-scale=1">';
    echo '<title>' . e($title) . '</title></head>';
    echo '<body style="font-family:Tahoma,sans-serif;text-align:center;padding:60px 20px;">';
    echo '<h1>' . e($title) . '</h1><p>' . e($message) . '</p>';
    echo '<p><a href="index.html">بازگشت به فروشگاه</a></p>';
    echo '</body></html>';
    exit;
}

// خوندن یک فایل JSON از پوشه‌ی data؛ اگه فایل خطا داشته باشه پیام واضح نشون می‌ده
function load_data($name) {
    $path = __DIR__ . '/data/' . $name . '.json';
    if (!file_exists($path)) {
        fail_page(500, 'فایل اطلاعات پیدا نشد', 'فایل data/' . $name . '.json وجود ندارد.');
    }
    $raw = file_get_contents($path);
    if (substr($raw, 0, 3) === "\xEF\xBB\xBF") {
        $raw = substr($raw, 3); // حذف BOM که بعضی ویرایشگرها اضافه می‌کنن
    }
    $data = json_decode($raw, true);
    if ($data === null) {
        fail_page(500, 'فایل اطلاعات خطا دارد',
            'در فایل data/' . $name . '.json یک ویرایش اشتباه (مثلاً کم‌بودن ویرگول یا گیومه) وجود دارد: ' . json_last_error_msg());
    }
    return array('data' => $data, 'raw' => $raw);
}

// متن JSON رو امن می‌کنه تا داخل <script> قرار بگیره
function json_for_script($raw) {
    return str_replace('</', '<\/', $raw);
}

// آدرس فایل ظاهر/برنامه‌ی سایت همراه شماره‌ی نسخه (از زمان آخرین تغییر فایل).
// مرورگر این فایل‌ها را یک بار می‌گیرد و نگه می‌دارد؛ وقتی فایل عوض شود، شماره عوض می‌شود و نسخه‌ی تازه گرفته می‌شود.
function asset_href($rel) {
    return $rel . '?v=' . (int)@filemtime(__DIR__ . '/' . $rel);
}

// محافظ آدرس سایت (برای وقتی که سایت منتشر شده).
// در data/settings.json:  "requireSiteUrl": false  → (حالت توسعه) هیچ محدودیتی نیست؛ آدرس در صورت خالی بودن siteUrl از درخواست ساخته می‌شود.
//                          "requireSiteUrl": true   → (حالت انتشار) اگر siteUrl خالی باشد، نقشه‌ی سایت ساخته نمی‌شود و
//                                                     canonical / hreflang / og:url / og:image در صفحه‌ها نمی‌آید؛ تا آدرس جعلی یا اشتباه (http) به گوگل نرسد.
function seo_urls_ready($settings) {
    if (empty($settings['requireSiteUrl'])) return true;
    return !empty($settings['siteUrl']);
}

// آدرس اصلی سایت (مثلاً https://example.com)؛ اگه توی data/settings.json پر نشده باشه خودکار از آدرس فعلی ساخته می‌شه
function site_url($settings) {
    if (!empty($settings['siteUrl'])) {
        return rtrim($settings['siteUrl'], '/');
    }
    $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https');
    $scheme = $https ? 'https' : 'http';
    $host = isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : 'localhost';
    $dir = str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME']));
    $dir = rtrim($dir, '/');
    return $scheme . '://' . $host . $dir;
}

// آدرس صفحه‌ی یک نویسنده (فارسی: author-slug.html — انگلیسی: en-author-slug.html)
function author_page_url($base, $slug, $lang = 'fa') {
    return $base . '/' . ($lang === 'en' ? 'en-author-' : 'author-') . $slug . '.html';
}

// آدرس صفحه‌ی اصلی (فارسی: / — انگلیسی: en.html)
function home_page_url($base, $lang = 'fa') {
    return $lang === 'en' ? $base . '/en.html' : $base . '/';
}

// نام انگلیسی سایت (اگر در settings.json فیلد siteNameEn نباشد، PDF Market)
function site_name_en($settings) {
    return !empty($settings['siteNameEn']) ? $settings['siteNameEn'] : 'PDF Market';
}

// زبان صفحه‌ای که الان درخواست شده. فقط از روی آدرس تشخیص داده می‌شود (en.html یا en-author-*.html)،
// تا یک آدرس فارسی با ?lang=en محتوای انگلیسی نشان ندهد. فقط وقتی فایل مستقیم (author.php / index.php) باز شده، ?lang=en هم قبول است (برای تست).
function request_lang() {
    $path = (string)parse_url(isset($_SERVER['REQUEST_URI']) ? $_SERVER['REQUEST_URI'] : '', PHP_URL_PATH);
    if (preg_match('#/(en|en-author-[a-z0-9-]+|en-book-[a-z0-9-]+)\.html$#', $path)) return 'en';
    if (preg_match('#/(author|index|book)\.php$#', $path) && isset($_GET['lang']) && $_GET['lang'] === 'en') return 'en';
    return 'fa';
}

// آیا متن حروف فارسی/عربی دارد؟
function has_arabic_script($s) {
    return (bool)preg_match('/\p{Arabic}/u', (string)$s);
}

// نسخه‌ی انگلیسی این نویسنده «آماده» است؟ یعنی هر چهار فیلد اسم، بیوگرافی، ملیت و ژانر انگلیسی واقعی دارند (نه خالی، نه کپی فارسی).
// فقط نویسنده‌ی آماده در نقشه‌ی سایت و hreflang می‌آید؛ بقیه صفحه‌ی انگلیسی‌شان noindex است.
function author_en_ready($a) {
    if (!is_array($a) || empty($a['slug'])) return false;
    foreach (array(array('name', 'en'), array('bio', 'en'), array('nationality', 'en'), array('genre', 'en')) as $k) {
        $v = isset($a[$k[0]][$k[1]]) ? trim($a[$k[0]][$k[1]]) : '';
        if ($v === '' || has_arabic_script($v)) return false;
    }
    return true;
}

// نسخه‌ی فارسی این نویسنده «آماده» است؟ یعنی هر چهار فیلد اسم، بیوگرافی، ملیت و ژانر فارسی واقعی دارند (نه خالی، نه کپی انگلیسی بدون حروف فارسی).
// نویسنده‌ی ناقص صفحه‌ی فارسی‌اش noindex است و در نقشه‌ی سایت نمی‌آید.
function author_fa_ready($a) {
    if (!is_array($a) || empty($a['slug'])) return false;
    foreach (array(array('name', 'fa'), array('bio', 'fa'), array('nationality', 'fa'), array('genre', 'fa')) as $k) {
        $v = isset($a[$k[0]][$k[1]]) ? trim($a[$k[0]][$k[1]]) : '';
        if ($v === '' || !has_arabic_script($v)) return false;
    }
    return true;
}

// گروه‌های ژانر پیش‌فرض (ژانرهایی که ادمین اضافه می‌کند در data/genres.json ذخیره می‌شوند)
function builtin_genre_groups() {
    return array(
        'psychological_fiction' => array('fa' => 'رمان روان‌شناختی و فلسفی', 'en' => 'Psychological & Philosophical Fiction'),
        'political_dystopian'   => array('fa' => 'رمان سیاسی و دیستوپیایی', 'en' => 'Political & Dystopian Fiction'),
        'self_help'             => array('fa' => 'روان‌شناسی رفتاری، خودیاری و موفقیت', 'en' => 'Self-Help, Behavioral Psychology & Success'),
        'surrealist_literature' => array('fa' => 'ادبیات مدرن و سوررئال', 'en' => 'Modern & Surrealist Literature'),
        'philosophy_meaning'    => array('fa' => 'فلسفه، معنا و روان‌شناسی امید', 'en' => 'Philosophy, Meaning & Psychology of Hope'),
        'classic_literature'    => array('fa' => 'شاهکارهای کلاسیک ادبیات جهان', 'en' => 'Classic World Literature'),
    );
}

function custom_genre_groups() {
    $path = __DIR__ . '/data/genres.json';
    if (!file_exists($path)) return array();
    $raw = file_get_contents($path);
    if (substr($raw, 0, 3) === "\xEF\xBB\xBF") $raw = substr($raw, 3);
    $d = json_decode($raw, true);
    return is_array($d) ? $d : array();
}

function all_genre_groups() {
    return array_merge(builtin_genre_groups(), custom_genre_groups());
}

// مسیر عکس یک نویسنده (یک منبع واحد برای صفحه‌ی نویسنده و کادر چهره‌ها).
// اول فیلد photo در authors.json، بعد images/authors/<slug>.jpg|jpeg|png|webp. اگر فایلی نبود رشته‌ی خالی برمی‌گرداند.
function author_photo_rel($a) {
    if (!is_array($a)) return '';
    if (!empty($a['photo']) && is_string($a['photo']) && preg_match('#^images/authors/[A-Za-z0-9_.-]+$#', $a['photo']) && is_file(__DIR__ . '/' . $a['photo'])) return $a['photo'];
    $slug = isset($a['slug']) ? (string)$a['slug'] : '';
    if ($slug !== '' && preg_match('/^[a-z0-9-]+$/', $slug)) {
        foreach (array('jpg', 'jpeg', 'png', 'webp') as $ext) {
            $rel = 'images/authors/' . $slug . '.' . $ext;
            if (is_file(__DIR__ . '/' . $rel)) return $rel;
        }
    }
    return '';
}

// آدرس عکس همراه نسخه (برای رفرش کش بعد از تعویض عکس)
function author_photo_url($a) {
    $rel = author_photo_rel($a);
    return $rel === '' ? '' : $rel . '?v=' . (int)@filemtime(__DIR__ . '/' . $rel);
}

// نسخه‌ی کوچک عکس نویسنده (برای کادر چهره‌ها): بیشینه ۳۲۰ پیکسل، webp (یا jpeg اگر webp پشتیبانی نشود).
// اولین بار که لازم شد خودکار ساخته می‌شود و در images/authors/thumbs/ می‌ماند؛ اگر عکس عوض شود دوباره ساخته می‌شود.
// اگر ساخت ممکن نبود (GD نیست یا پوشه قابل نوشتن نیست) همان عکس اصلی برگردانده می‌شود، پس هیچ‌وقت چیزی خراب نمی‌شود.
// برای اینکه از هر عکس نویسنده فقط یک فایل روی سرور بماند، ساخت نسخه‌ی کوچک (thumbs) خاموش است و همان عکس اصلی نشان داده می‌شود.
// اگر دوباره نسخه‌ی کوچک خواستی (سریع‌تر برای کادر چهره‌ها)، این مقدار را true کن.
if (!defined('AUTHOR_THUMBS_ENABLED')) define('AUTHOR_THUMBS_ENABLED', false);
function author_thumb_url($a) {
    $rel = author_photo_rel($a);
    if ($rel === '') return '';
    if (!AUTHOR_THUMBS_ENABLED) return author_photo_url($a);
    $src = __DIR__ . '/' . $rel;
    $orig = $rel . '?v=' . (int)@filemtime($src);
    if (!function_exists('imagecreatetruecolor') || !function_exists('getimagesize')) return $orig;
    $useWebp = function_exists('imagewebp');
    $ext = $useWebp ? 'webp' : 'jpg';
    $base = pathinfo($rel, PATHINFO_FILENAME);
    $tRel = 'images/authors/thumbs/' . $base . '-320.' . $ext;
    $tAbs = __DIR__ . '/' . $tRel;
    $srcTime = (int)@filemtime($src);
    if (is_file($tAbs) && (int)@filemtime($tAbs) >= $srcTime) return $tRel . '?v=' . (int)@filemtime($tAbs);
    try {
        $info = @getimagesize($src);
        if (!$info || empty($info[0]) || empty($info[1]) || $info[0] * $info[1] > 40000000) return $orig;
        $loaders = array(IMAGETYPE_JPEG => 'imagecreatefromjpeg', IMAGETYPE_PNG => 'imagecreatefrompng', IMAGETYPE_WEBP => 'imagecreatefromwebp');
        $fn = isset($loaders[$info[2]]) ? $loaders[$info[2]] : '';
        if ($fn === '' || !function_exists($fn)) return $orig;
        $dir = dirname($tAbs);
        if (!is_dir($dir) && !@mkdir($dir, 0755, true)) return $orig;
        $im = @$fn($src);
        if (!$im) return $orig;
        $w = imagesx($im); $h = imagesy($im);
        $k = min(1, 320 / max($w, $h));
        $nw = max(1, (int)round($w * $k)); $nh = max(1, (int)round($h * $k));
        $t = imagecreatetruecolor($nw, $nh);
        imagealphablending($t, false); imagesavealpha($t, true);
        imagefill($t, 0, 0, imagecolorallocatealpha($t, 255, 255, 255, 127));
        imagecopyresampled($t, $im, 0, 0, 0, 0, $nw, $nh, $w, $h);
        $tmp = $tAbs . '.tmp' . getmypid();
        $ok = $useWebp ? @imagewebp($t, $tmp, 82) : @imagejpeg($t, $tmp, 82);
        imagedestroy($im); imagedestroy($t);
        if (!$ok || !is_file($tmp) || filesize($tmp) < 100) { @unlink($tmp); return $orig; }
        if (!@rename($tmp, $tAbs)) { @unlink($tmp); return $orig; }
        return $tRel . '?v=' . (int)@filemtime($tAbs);
    } catch (\Throwable $e) {
        return $orig;
    }
}

// لیست نویسنده‌ها برای سایت: همان داده‌ی authors.json + فیلد photoUrl (عکس واقعیِ موجود روی سرور)
function authors_public_json($authors) {
    $out = array();
    foreach ($authors as $a) {
        if (is_array($a)) { $u = author_photo_url($a); if ($u !== '') $a['photoUrl'] = $u; }
        $out[] = $a;
    }
    return json_for_script(json_encode($out, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG));
}

// «کادر چهره‌ها» (data/featured.json فقط ترتیب و انتخاب نویسنده‌هاست).
// اسم، لینک صفحه و عکس هر مورد خودکار از خود نویسنده گرفته می‌شود؛ پس تغییر عکس/اسم نویسنده همین‌جا هم اعمال می‌شود.
// خروجی: JSON امن برای <script>. اگر چیزی نباشد "[]" است و سایت ردیف پیش‌فرض را نشان می‌دهد.
function featured_public_json() {
    $path = __DIR__ . '/data/featured.json';
    $apath = __DIR__ . '/data/authors.json';
    $out = array();
    $byId = array();
    if (is_file($apath)) {
        $raw = file_get_contents($apath);
        if (substr($raw, 0, 3) === "\xEF\xBB\xBF") $raw = substr($raw, 3);
        $ad = json_decode($raw, true);
        if (is_array($ad)) foreach ($ad as $a) if (is_array($a) && !empty($a['id'])) $byId[$a['id']] = $a;
    }
    if (is_file($path)) {
        $raw = file_get_contents($path);
        if (substr($raw, 0, 3) === "\xEF\xBB\xBF") $raw = substr($raw, 3);
        $d = json_decode($raw, true);
        if (is_array($d)) foreach ($d as $it) {
            if (!is_array($it) || empty($it['id']) || empty($it['authorId'])) continue;
            $a = isset($byId[$it['authorId']]) ? $byId[$it['authorId']] : null;
            if (!$a) continue;
            $img = author_thumb_url($a);   // نسخه‌ی کوچک و سریع برای کادر چهره‌ها
            // سازگاری با موردهای قدیمی که عکس جداگانه داشتند
            if ($img === '' && !empty($it['image']) && preg_match('#^images/featured/[A-Za-z0-9_.-]+$#', $it['image']) && is_file(__DIR__ . '/' . $it['image'])) {
                $img = $it['image'] . '?v=' . (int)filemtime(__DIR__ . '/' . $it['image']);
            }
            $out[] = array('id' => (string)$it['id'], 'authorId' => (string)$a['id'], 'slug' => (string)($a['slug'] ?? ''), 'image' => $img);
        }
    }
    return json_encode($out, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG);
}
