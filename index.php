<?php
// ============================================================
// صفحه‌ی اصلی فروشگاه: از روی قالب و فایل‌های data ساخته می‌شود.
// هر تغییری که در پنل ادمین بدهی (نویسنده، کتاب، ژانر) همین‌جا هم دیده می‌شود.
// ============================================================
require_once __DIR__ . '/lib.php';

$authorsFile = load_data('authors');
$booksFile = load_data('books');
// اطلاعات فایل PDF (نام فایل روی سرور) نباید در صفحه‌ی عمومی دیده شود؛ فقط «hasPdf» می‌ماند
$pubBooks = $booksFile['data'];
foreach ($pubBooks as $k => $bk) {
    if (is_array($bk)) { $pubBooks[$k]['cover'] = book_cover_public($bk); $pubBooks[$k]['hasPdf'] = !empty($bk['pdf']['file']); $pubBooks[$k]['pdfKind'] = (!empty($bk['pdf']['file']) && isset($bk['pdf']['kind']) && is_string($bk['pdf']['kind'])) ? $bk['pdf']['kind'] : ''; unset($pubBooks[$k]['pdf']); }
}
$booksPublicRaw = json_encode($pubBooks, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG);
$genresJson = json_encode(all_genre_groups(), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG);

// ---- زبان صفحه + بخش سئو (عنوان، توضیح، آدرس اصلی، نسخه‌ی فارسی/انگلیسی برای گوگل) ----
$settingsFile = load_data('settings');
$settings = $settingsFile['data'];
$lang = request_lang();   // فارسی: آدرس اصلی — انگلیسی: en.html
$isEn = ($lang === 'en');
$base = site_url($settings);
$seoUrls = seo_urls_ready($settings);   // false = حالت انتشار و siteUrl خالی؛ آدرس‌های مطلق به گوگل داده نمی‌شود
$urlFa = home_page_url($base, 'fa');
$urlEn = home_page_url($base, 'en');
$pageUrl = $isEn ? $urlEn : $urlFa;
$siteNameFa = isset($settings['siteName']) ? $settings['siteName'] : 'PDF مارکت';
$siteNameEn = site_name_en($settings);
$title = $isEn ? $siteNameEn . ' | Digital Books Reference' : $siteNameFa . ' | مرجع کتاب‌های دیجیتال';
$desc = $isEn
    ? $siteNameEn . ' is a reference for buying PDF editions of trusted books by Iranian and world authors and publishers.'
    : $siteNameFa . '، مرجع خرید نسخه‌ی PDF کتاب‌های معتبر از نویسندگان و ناشران معتبر ایرانی و جهانی.';
$head = '<title>' . e($title) . '</title>' . "\n"
    . '  <meta name="description" content="' . e($desc) . '">' . "\n"
    . ($seoUrls ? '  <link rel="canonical" href="' . e($pageUrl) . '">' . "\n"
    . '  <link rel="alternate" hreflang="fa" href="' . e($urlFa) . '">' . "\n"
    . '  <link rel="alternate" hreflang="en" href="' . e($urlEn) . '">' . "\n"
    . '  <link rel="alternate" hreflang="x-default" href="' . e($urlFa) . '">' . "\n" : '')
    . '  <meta property="og:type" content="website">' . "\n"
    . '  <meta property="og:locale" content="' . ($isEn ? 'en_US' : 'fa_IR') . '">' . "\n"
    . '  <meta property="og:locale:alternate" content="' . ($isEn ? 'fa_IR' : 'en_US') . '">' . "\n"
    . '  <meta property="og:site_name" content="' . e($isEn ? $siteNameEn : $siteNameFa) . '">' . "\n"
    . '  <meta property="og:title" content="' . e($title) . '">' . "\n"
    . '  <meta property="og:description" content="' . e($desc) . '">' . "\n"
    . ($seoUrls ? '  <meta property="og:url" content="' . e($pageUrl) . '">' : '');

$template = file_get_contents(__DIR__ . '/templates/index-template.html');
$html = strtr($template, array(
    '{{SEO_HEAD}}' => $head,
    '{{CSS_HREF}}' => asset_href('assets/index.css'),
    '{{JS_HREF}}' => asset_href('assets/app-index.js'),
    '{{LANG}}' => $lang,
    '{{HOME_HREF}}' => $isEn ? 'en.html' : 'index.html',
    '{{DIR}}' => $isEn ? 'ltr' : 'rtl',
    '{{BODY_CLASS}}' => $isEn ? 'en-mode' : '',
    '{{PAGE_LANG_JSON}}' => json_encode($lang),
    '{{ALT_URL_JSON}}' => json_encode($isEn ? 'index.html' : 'en.html'),
    '{{AUTHORS_JSON}}' => authors_public_json($authorsFile['data']),
    '{{BOOKS_JSON}}' => json_for_script($booksPublicRaw),
    '{{GENRE_GROUPS_JSON}}' => $genresJson,
    '{{FEATURED_JSON}}' => featured_public_json(),
));

header('Content-Type: text/html; charset=utf-8');
echo $html;
