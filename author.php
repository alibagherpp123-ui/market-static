<?php
// ============================================================
// صفحه‌ی نویسنده: یک قالب برای همه‌ی نویسنده‌ها
// آدرس: author-hedayat.html  (توسط .htaccess به author.php?slug=hedayat تبدیل می‌شه)
// اطلاعات از data/authors.json و data/books.json خونده می‌شه.
// ============================================================
require_once __DIR__ . '/lib.php';

$slug = (isset($_GET['slug']) && is_string($_GET['slug'])) ? strtolower($_GET['slug']) : '';
$slug = preg_replace('/[^a-z0-9\-]/', '', $slug);

$authorsFile = load_data('authors');
$booksFile = load_data('books');
$settingsFile = load_data('settings');
$authors = $authorsFile['data'];
$books = $booksFile['data'];
$settings = $settingsFile['data'];

// پیدا کردن نویسنده‌ای که slug اش با آدرس یکیه
$author = null;
if ($slug !== '') {
    foreach ($authors as $a) {
        if (isset($a['slug']) && $a['slug'] === $slug) {
            $author = $a;
            break;
        }
    }
}
if ($author === null || !isset($author['name']['fa']) || !isset($author['name']['en'])) {
    fail_page(404, 'نویسنده پیدا نشد', 'صفحه‌ای با این آدرس وجود ندارد.');
}

$lang = request_lang();          // 'fa' یا 'en' (از روی آدرس: author-x.html یا en-author-x.html)
$isEn = ($lang === 'en');
$L = function ($fa, $en) use ($isEn) { return $isEn ? $en : $fa; };

$siteNameFa = isset($settings['siteName']) ? $settings['siteName'] : 'PDF مارکت';
$siteNameEn = site_name_en($settings);
$siteName = $isEn ? $siteNameEn : $siteNameFa;
$base = site_url($settings);
$pageUrlFa = author_page_url($base, $slug, 'fa');
$pageUrlEn = author_page_url($base, $slug, 'en');
$pageUrl = $isEn ? $pageUrlEn : $pageUrlFa;
$enReady = author_en_ready($author);
$faReady = author_fa_ready($author);
$bothReady = ($enReady && $faReady);   // hreflang فقط وقتی هر دو زبان کامل باشند
$seoUrls = seo_urls_ready($settings);   // false = حالت انتشار و siteUrl خالی؛ آدرس‌های مطلق به گوگل داده نمی‌شود

$nameFa = $author['name']['fa'];
$nameEn = $author['name']['en'];
$name = $isEn ? $nameEn : $nameFa;          // اسم به زبان همین صفحه
$birth = isset($author['birthYear']) ? $author['birthYear'] : '';
$death = !empty($author['deathYear']) ? $author['deathYear'] : '';
$nationality = isset($author['nationality'][$lang]) ? $author['nationality'][$lang] : '';
$genre = isset($author['genre'][$lang]) ? $author['genre'][$lang] : '';
$bio = isset($author['bio'][$lang]) ? $author['bio'][$lang] : '';
$emoji = isset($author['avatarEmoji']) ? $author['avatarEmoji'] : '📖';

if ($birth !== '' && $death !== '') {
    $lifespan = $birth . ' – ' . $death;
} elseif ($birth !== '') {
    $lifespan = $birth . ' – ' . $L('(هم‌اکنون)', '(present)');
} else {
    $lifespan = '';
}

// کتاب‌های این نویسنده (برای لیست متنی که گوگل می‌خونه) + پیدا کردن گروه ژانر
$staticBooks = '<ul class="author-static-books">';
$firstGroup = '';
foreach ($books as $b) {
    if (isset($b['authorId']) && $b['authorId'] === $author['id']) {
        $bTitle = isset($b['title'][$lang]) ? $b['title'][$lang] : '';
        if (book_text_ready($b, $lang)) {
            $bFile = book_page_file($b, $lang);
            $staticBooks .= "\n<li><a href=\"" . e($bFile) . '">' . e($bTitle) . '</a></li>';
        } else {
            $staticBooks .= "\n<li>" . e($bTitle) . '</li>';
        }
        if ($firstGroup === '' && isset($b['genreGroup'])) {
            $firstGroup = $b['genreGroup'];
        }
    }
}
$staticBooks .= "\n</ul>";
$genreGroup = isset($author['genreGroup']) ? $author['genreGroup'] : $firstGroup;

// بخش «از کجا شروع کنیم؟» فقط برای نویسنده‌ای که این اطلاعات رو (به زبان همین صفحه) داره
$readingOrderBlock = '';
if (!empty($author['readingOrder'][$lang]['summary']) && !empty($author['readingOrder'][$lang]['body'])) {
    $readingOrderBlock = '<details class="author-bio-details">'
        . '<summary id="authorReadingOrderSummary">' . e($author['readingOrder'][$lang]['summary']) . '</summary>'
        . '<div class="author-page-bio" id="authorReadingOrderBody">' . $author['readingOrder'][$lang]['body'] . '</div>'
        . '</details>';
}

// عکس نویسنده: به‌صورت پیش‌فرض images/authors/<slug>.jpg
$photoRel = author_photo_rel($author);
$photoExists = ($photoRel !== '');
if (!$photoExists) $photoRel = 'images/authors/' . $slug . '.jpg';

// ---- بخش سئو: عنوان، توضیح، آدرس اصلی، زبان‌ها (hreflang)، پیش‌نمایش اشتراک‌گذاری، داده‌ی ساختاریافته ----
if ($isEn) {
    $titleMiddle = ($readingOrderBlock !== '') ? 'Full Biography, Reading Order & PDF Books' : 'Full Biography & PDF Books';
    $pageTitle = $nameEn . ' | ' . $titleMiddle . ' | ' . $siteName;
} else {
    $titleMiddle = ($readingOrderBlock !== '') ? 'بیوگرافی کامل، ترتیب مطالعه و کتاب‌های PDF' : 'بیوگرافی کامل و کتاب‌های PDF';
    $pageTitle = $nameFa . ' | ' . $titleMiddle . ' | ' . $siteName;
}

if (!empty($author['metaDescription'][$lang])) {
    $metaDesc = $author['metaDescription'][$lang];
} else {
    $years = ($birth !== '' && $death !== '') ? ' (' . $birth . '–' . $death . ')' : '';
    if ($isEn) {
        $metaDesc = 'Full biography of ' . $nameEn . $years;
        if ($genre !== '') { $metaDesc .= ', ' . $genre; }
        $metaDesc .= '. Life story, overview of works and PDF book downloads on ' . $siteName . '.';
    } else {
        $metaDesc = 'بیوگرافی کامل ' . $nameFa . $years;
        if ($genre !== '') { $metaDesc .= '، ' . $genre; }
        $metaDesc .= '. زندگی‌نامه، معرفی آثار و دانلود کتاب‌های PDF او در ' . $siteName . '.';
    }
}

$ld = array(
    '@context' => 'https://schema.org',
    '@type' => 'Person',
    'name' => $name,
    'alternateName' => $isEn ? $nameFa : $nameEn,
    'url' => $pageUrl,
);
if ($bio !== '') { $ld['description'] = bio_to_plain($bio); }
if ($nationality !== '') { $ld['nationality'] = $nationality; }
if ($birth !== '') { $ld['birthDate'] = (string)$birth; }
if ($death !== '') { $ld['deathDate'] = (string)$death; }
if ($photoExists) { $ld['image'] = $base . '/' . $photoRel; }

// ابعاد واقعی عکس (برای width/height در <img> و og:image:width/height)
$photoW = 0; $photoH = 0;
if ($photoExists) {
    $sz = @getimagesize(__DIR__ . '/' . $photoRel);
    if (is_array($sz) && $sz[0] > 0 && $sz[1] > 0) { $photoW = (int)$sz[0]; $photoH = (int)$sz[1]; }
}
$photoAlt = $L('عکس ' . $nameFa . '، نویسنده', 'Photo of ' . $nameEn . ', author');
$photoAbs = $photoExists ? $base . '/' . $photoRel : '';

// مسیر صفحه (BreadcrumbList): خانه ‹ نام نویسنده
$breadcrumb = array(
    '@context' => 'https://schema.org',
    '@type' => 'BreadcrumbList',
    'itemListElement' => array(
        array('@type' => 'ListItem', 'position' => 1, 'name' => $siteName, 'item' => home_page_url($base, $lang)),
        array('@type' => 'ListItem', 'position' => 2, 'name' => $name, 'item' => $pageUrl),
    ),
);

$head = '<title>' . e($pageTitle) . '</title>' . "\n"
    . '  <meta name="description" content="' . e($metaDesc) . '">' . "\n"
    . ($seoUrls ? '  <link rel="canonical" href="' . e($pageUrl) . '">' . "\n" : '');
if ($isEn && !$enReady) {
    // نسخه‌ی انگلیسی هنوز بیوگرافی انگلیسی واقعی ندارد؛ تا آماده نشده در گوگل نیاید (محتوای تکراری/ناقص)
    $head .= '  <meta name="robots" content="noindex,follow">' . "\n";
}
if (!$isEn && !$faReady) {
    // نسخه‌ی فارسی هم کامل نیست (اسم/بیو/ملیت/ژانر فارسی واقعی ندارد)؛ تا کامل نشده در گوگل نیاید
    $head .= '  <meta name="robots" content="noindex,follow">' . "\n";
}
if ($bothReady && $seoUrls) {
    $head .= '  <link rel="alternate" hreflang="fa" href="' . e($pageUrlFa) . '">' . "\n"
        . '  <link rel="alternate" hreflang="en" href="' . e($pageUrlEn) . '">' . "\n"
        . '  <link rel="alternate" hreflang="x-default" href="' . e($pageUrlFa) . '">' . "\n";
}
$head .= '  <meta property="og:type" content="profile">' . "\n"
    . '  <meta property="og:locale" content="' . ($isEn ? 'en_US' : 'fa_IR') . '">' . "\n"
    . ($bothReady ? '  <meta property="og:locale:alternate" content="' . ($isEn ? 'fa_IR' : 'en_US') . '">' . "\n" : '')
    . '  <meta property="og:site_name" content="' . e($siteName) . '">' . "\n"
    . '  <meta property="og:title" content="' . e($pageTitle) . '">' . "\n"
    . '  <meta property="og:description" content="' . e($metaDesc) . '">' . "\n"
    . ($seoUrls ? '  <meta property="og:url" content="' . e($pageUrl) . '">' . "\n" : '');
if ($photoExists && $seoUrls) {
    $head .= '  <meta property="og:image" content="' . e($photoAbs) . '">' . "\n"
        . '  <meta property="og:image:alt" content="' . e($photoAlt) . '">' . "\n";
    if ($photoW > 0) {
        $head .= '  <meta property="og:image:width" content="' . $photoW . '">' . "\n"
            . '  <meta property="og:image:height" content="' . $photoH . '">' . "\n";
    }
}
// کارت توییتر (X): با عکس → summary_large_image، بدون عکس → summary
$head .= '  <meta name="twitter:card" content="' . ($photoExists ? 'summary_large_image' : 'summary') . '">' . "\n"
    . '  <meta name="twitter:title" content="' . e($pageTitle) . '">' . "\n"
    . '  <meta name="twitter:description" content="' . e($metaDesc) . '">' . "\n";
if ($photoExists && $seoUrls) {
    $head .= '  <meta name="twitter:image" content="' . e($photoAbs) . '">' . "\n"
        . '  <meta name="twitter:image:alt" content="' . e($photoAlt) . '">' . "\n";
}
if (!$seoUrls) { unset($ld['url'], $ld['image']); }
$head .= '  <script type="application/ld+json">'
    . json_encode($ld, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG)
    . '</script>';
if ($seoUrls) {
    $head .= "\n" . '  <script type="application/ld+json">'
        . json_encode($breadcrumb, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG)
        . '</script>';
}

// ---- پر کردن قالب ----
$template = file_get_contents(__DIR__ . '/templates/author-template.html');
// اطلاعات داخلی فایل PDF (نام فایل روی سرور) نباید در صفحه‌ی عمومی دیده شود؛ فقط «hasPdf» می‌ماند (مثل index.php)
$pubBooks = $booksFile['data'];
foreach ($pubBooks as $k => $bk) {
    if (is_array($bk)) { $pubBooks[$k]['cover'] = book_cover_public($bk); $pubBooks[$k]['hasPdf'] = !empty($bk['pdf']['file']); $pubBooks[$k]['pdfKind'] = (!empty($bk['pdf']['file']) && isset($bk['pdf']['kind']) && is_string($bk['pdf']['kind'])) ? $bk['pdf']['kind'] : ''; unset($pubBooks[$k]['pdf']); }
}
$booksPublicRaw = json_encode($pubBooks, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG);

// پرسش‌های متداول (اختیاری): در authors.json به شکل "faq": {"fa": [{"q": "...", "a": "..."}], "en": [...]}
$faqBlock = faq_to_html(
    isset($author['faq'][$lang]) ? $author['faq'][$lang] : array(),
    $L('❓ پرسش‌های متداول درباره‌ی ' . $nameFa, '❓ FAQ about ' . $nameEn)
);

$replace = array(
    '{{SEO_HEAD}}' => $head,
    '{{PHOTO_SRC}}' => e($photoExists ? author_photo_url($author) : $photoRel),
    '{{NAME}}' => e($name),
    '{{SITE_NAME}}' => e($siteName),
    '{{CSS_HREF}}' => asset_href('assets/author.css'),
    '{{JS_HREF}}' => asset_href('assets/app-author.js'),
    '{{LANG}}' => $lang,
    '{{DIR}}' => $isEn ? 'ltr' : 'rtl',
    '{{BODY_CLASS}}' => $isEn ? 'en-mode' : '',
    '{{HOME_HREF}}' => $isEn ? 'en.html' : 'index.html',
    '{{PAGE_LANG_JSON}}' => json_encode($lang),
    '{{ALT_URL_JSON}}' => json_encode(($isEn ? 'author-' : 'en-author-') . $slug . '.html'),
    '{{L_LIFESPAN}}' => e($L('سال تولد – وفات:', 'Born – Died:')),
    '{{L_NATIONALITY}}' => e($L('ملیت:', 'Nationality:')),
    '{{L_GENRE}}' => e($L('سبک و ژانر ادبی:', 'Literary Genre & Style:')),
    '{{L_BIO_SUMMARY}}' => e($L('📖 زندگی‌نامه ' . $nameFa, '📖 Biography of ' . $nameEn)),
    '{{L_BOOKS_HEADING}}' => e($L('📚 کتاب‌های ' . $nameFa, '📚 Books by ' . $nameEn)),
    '{{L_BREADCRUMB}}' => e($L('مسیر صفحه', 'Breadcrumb')),
    '{{PHOTO_ALT}}' => e($photoAlt),
    '{{PHOTO_SIZE_ATTRS}}' => ($photoW > 0 ? 'width="' . $photoW . '" height="' . $photoH . '"' : ''),
    '{{EMOJI}}' => e($emoji),
    '{{LIFESPAN}}' => e($lifespan),
    '{{NATIONALITY}}' => e($nationality),
    '{{GENRE}}' => e($genre),
    '{{GENRE_GROUP}}' => e($genreGroup),
    '{{BIO}}' => bio_to_html($bio),
    '{{FAQ_BLOCK}}' => $faqBlock,
    '{{READING_ORDER_BLOCK}}' => $readingOrderBlock,
    '{{AUTHOR_ID}}' => e($author['id']),
    '{{STATIC_BOOKS}}' => $staticBooks,
    '{{NAME_FA_JSON}}' => json_encode($nameFa, JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_APOS),
    '{{NAME_EN_JSON}}' => json_encode($nameEn, JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_APOS),
    '{{AUTHORS_JSON}}' => authors_public_json($authorsFile['data']),
    '{{FEATURED_JSON}}' => featured_public_json(),
    '{{BOOKS_JSON}}' => json_for_script($booksPublicRaw),
    '{{GENRE_GROUPS_JSON}}' => json_encode(all_genre_groups(), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG),
);
// strtr: هر نشانه فقط یک‌بار جایگزین می‌شود (متنِ داخل داده‌ها، مثل بیوگرافی، دوباره جایگزین نمی‌شود)
$html = strtr($template, $replace);

header('Content-Type: text/html; charset=utf-8');
echo $html;
