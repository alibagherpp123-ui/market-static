<?php
// ============================================================
// صفحه‌ی مستقل هر کتاب (تصویر نویسنده + جلد کتاب + توضیحات + ذخیره / مطالعه‌ی نمونه / خرید)
// روی همون قالب کامل صفحه‌ی نویسنده ساخته می‌شه (تا ورود، سبد خرید و خواندن نمونه کار کنن).
// آدرس: book-1-crime-and-punishment.html  (توسط .htaccess به book.php?id=1 تبدیل می‌شه)
//        en-book-1-crime-and-punishment.html  (نسخه‌ی انگلیسی)
// اطلاعات از data/books.json، data/authors.json و data/settings.json خونده می‌شه.
// ============================================================
require_once __DIR__ . '/lib.php';

$id = (isset($_GET['id']) && is_string($_GET['id'])) ? strtolower($_GET['id']) : '';
$id = preg_replace('/[^a-z0-9]/', '', $id);

$booksFile = load_data('books');
$authorsFile = load_data('authors');
$settingsFile = load_data('settings');
$books = $booksFile['data'];
$authors = $authorsFile['data'];
$settings = $settingsFile['data'];

$book = null;
if ($id !== '') {
    foreach ($books as $b) {
        if (is_array($b) && book_id_clean($b) === $id) { $book = $b; break; }
    }
}
if ($book === null || !isset($book['title']['fa']) || !isset($book['title']['en'])) {
    fail_page(404, 'کتاب پیدا نشد', 'صفحه‌ای با این آدرس وجود ندارد.');
}
$author = isset($book['authorId']) ? find_author_by_id($authors, $book['authorId']) : null;

$lang = request_lang();
$isEn = ($lang === 'en');
$L = function ($fa, $en) use ($isEn) { return $isEn ? $en : $fa; };

$siteNameFa = isset($settings['siteName']) ? $settings['siteName'] : 'PDF مارکت';
$siteNameEn = site_name_en($settings);
$siteName = $isEn ? $siteNameEn : $siteNameFa;
$base = site_url($settings);
$seoUrls = seo_urls_ready($settings);

// آدرس درست (کانونیکال): اگه کسی با اسم قدیمی/ناقص اومد، به آدرس درست هدایت می‌شه (301)
$canonFile = book_page_file($book, $lang);
$reqPath = (string)parse_url(isset($_SERVER['REQUEST_URI']) ? $_SERVER['REQUEST_URI'] : '', PHP_URL_PATH);
if (preg_match('#/(en-)?book-[a-z0-9]+(-[a-z0-9-]*)?\.html$#', $reqPath) && basename($reqPath) !== $canonFile) {
    header('Location: ' . $base . '/' . $canonFile, true, 301);
    exit;
}
$pageUrlFa = book_page_url($base, $book, 'fa');
$pageUrlEn = book_page_url($base, $book, 'en');
$pageUrl = $isEn ? $pageUrlEn : $pageUrlFa;
$faOk = book_indexable($book, 'fa');
$enOk = book_indexable($book, 'en');
$indexable = $isEn ? $enOk : $faOk;
$bothOk = ($faOk && $enOk);

$title = isset($book['title'][$lang]) ? trim($book['title'][$lang]) : '';
if ($title === '') $title = $book['title'][$isEn ? 'fa' : 'en'];
$authorName = ($author !== null && isset($author['name'][$lang])) ? $author['name'][$lang] : (isset($book['author'][$lang]) ? $book['author'][$lang] : '');
$desc = isset($book['desc'][$lang]) ? trim((string)$book['desc'][$lang]) : '';
$bio = isset($book['bio'][$lang]) ? trim((string)$book['bio'][$lang]) : '';
$genre = isset($book['genre'][$lang]) ? $book['genre'][$lang] : '';
$translator = isset($book['translator'][$lang]) ? trim((string)$book['translator'][$lang]) : '';
$publisher = isset($book['publisher'][$lang]) ? trim((string)$book['publisher'][$lang]) : '';
$pages = isset($book['pages']) ? (int)$book['pages'] : 0;
$hasPdf = !empty($book['pdf']['file']);

// ---- سئو ----
if ($isEn) {
    $pageTitle = $title . ($authorName !== '' ? ' by ' . $authorName : '') . ' | ' . ($hasPdf ? 'Book Overview & PDF' : 'Book Overview') . ' | ' . $siteName;
} else {
    $pageTitle = $title . ($authorName !== '' ? ' اثر ' . $authorName : '') . ' | ' . ($hasPdf ? 'معرفی و دانلود PDF' : 'معرفی کتاب') . ' | ' . $siteName;
}
if (!empty($book['metaDescription'][$lang])) {
    $metaDesc = $book['metaDescription'][$lang];
} else {
    $metaDesc = cut_text($desc !== '' ? $desc : bio_to_plain($bio), 158);
}
$pageLangTag = $isEn ? 'en' : 'fa';

$ld = array(
    '@context' => 'https://schema.org',
    '@type' => 'Book',
    'name' => $title,
    'inLanguage' => $pageLangTag,
    'url' => $pageUrl,
);
if ($authorName !== '') {
    $ldAuthor = array('@type' => 'Person', 'name' => $authorName);
    if ($author !== null && !empty($author['slug']) && $seoUrls) {
        $ldAuthor['url'] = author_page_url($base, $author['slug'], $lang);
    }
    $ld['author'] = $ldAuthor;
}
if ($translator !== '') { $ld['translator'] = array('@type' => 'Person', 'name' => $translator); }
if ($publisher !== '') { $ld['publisher'] = array('@type' => 'Organization', 'name' => $publisher); }
if ($pages > 0) { $ld['numberOfPages'] = $pages; }
if ($genre !== '') { $ld['genre'] = $genre; }
if ($metaDesc !== '') { $ld['description'] = $metaDesc; }
$coverForSeo = book_cover_rel($book);
$coverAbs = ($coverForSeo !== '' && $base !== '') ? $base . '/' . $coverForSeo . '?v=' . (int)@filemtime(__DIR__ . '/' . $coverForSeo) : '';
if ($coverAbs !== '') { $ld['image'] = $coverAbs; }
if (!$seoUrls) { unset($ld['url']); }

$crumbs = array(
    array('@type' => 'ListItem', 'position' => 1, 'name' => $siteName, 'item' => home_page_url($base, $lang)),
);
if ($author !== null && !empty($author['slug'])) {
    $crumbs[] = array('@type' => 'ListItem', 'position' => 2, 'name' => $authorName, 'item' => author_page_url($base, $author['slug'], $lang));
    $crumbs[] = array('@type' => 'ListItem', 'position' => 3, 'name' => $title, 'item' => $pageUrl);
} else {
    $crumbs[] = array('@type' => 'ListItem', 'position' => 2, 'name' => $title, 'item' => $pageUrl);
}
$breadcrumb = array('@context' => 'https://schema.org', '@type' => 'BreadcrumbList', 'itemListElement' => $crumbs);

$head = '<title>' . e($pageTitle) . '</title>' . "\n"
    . '  <meta name="description" content="' . e($metaDesc) . '">' . "\n"
    . ($seoUrls ? '  <link rel="canonical" href="' . e($pageUrl) . '">' . "\n" : '');
if (!$indexable) {
    // متن این زبان هنوز واقعی/کافی نیست؛ تا کامل نشده در گوگل نیاید
    $head .= '  <meta name="robots" content="noindex,follow">' . "\n";
}
if ($bothOk && $seoUrls) {
    $head .= '  <link rel="alternate" hreflang="fa" href="' . e($pageUrlFa) . '">' . "\n"
        . '  <link rel="alternate" hreflang="en" href="' . e($pageUrlEn) . '">' . "\n"
        . '  <link rel="alternate" hreflang="x-default" href="' . e($pageUrlFa) . '">' . "\n";
}
$head .= '  <meta property="og:type" content="book">' . "\n"
    . '  <meta property="og:locale" content="' . ($isEn ? 'en_US' : 'fa_IR') . '">' . "\n"
    . ($bothOk ? '  <meta property="og:locale:alternate" content="' . ($isEn ? 'fa_IR' : 'en_US') . '">' . "\n" : '')
    . '  <meta property="og:site_name" content="' . e($siteName) . '">' . "\n"
    . '  <meta property="og:title" content="' . e($pageTitle) . '">' . "\n"
    . '  <meta property="og:description" content="' . e($metaDesc) . '">' . "\n"
    . ($seoUrls ? '  <meta property="og:url" content="' . e($pageUrl) . '">' . "\n" : '')
    . ($coverAbs !== '' ? '  <meta property="og:image" content="' . e($coverAbs) . '">' . "\n" : '')
    . '  <meta name="twitter:card" content="' . ($coverAbs !== '' ? 'summary_large_image' : 'summary') . '">' . "\n"
    . '  <meta name="twitter:title" content="' . e($pageTitle) . '">' . "\n"
    . '  <meta name="twitter:description" content="' . e($metaDesc) . '">' . "\n"
    . '  <script type="application/ld+json">'
    . json_encode($ld, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG)
    . '</script>';
if ($seoUrls) {
    $head .= "\n" . '  <script type="application/ld+json">'
        . json_encode($breadcrumb, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG)
        . '</script>';
}

// ---- بخش‌های صفحه ----
$homeHref = $isEn ? 'en.html' : 'index.html';
$authorFile = ($author !== null && !empty($author['slug'])) ? author_page_file($author['slug'], $lang) : '';
$bidJs = e(preg_replace('/[^A-Za-z0-9_-]/', '', (string)$book['id']));   // شماره‌ی کتاب برای دکمه‌ها (همون id داخل داده‌ی صفحه)

// مسیر صفحه: خانه ‹ نویسنده ‹ کتاب
$crumbHtml = '<a class="author-back-link" href="' . e($homeHref) . '"><span>' . e($siteName) . '</span></a>';
if ($authorFile !== '') {
    $crumbHtml .= '<span class="author-breadcrumb-sep" aria-hidden="true"></span>'
        . '<a class="author-back-link" href="' . e($authorFile) . '"><span>' . e($authorName) . '</span></a>';
}
$crumbHtml .= '<span class="author-breadcrumb-sep" aria-hidden="true"></span>'
    . '<span class="author-breadcrumb-current" aria-current="page">' . e($title) . '</span>';

// تصویر کتاب: اگه عکس جلد آپلود شده باشه همون، وگرنه فقط اسم کتاب روی یه جلد ساده تایپ می‌شه
$coverRel = book_cover_rel($book);
if ($coverRel !== '') {
    $coverHtml = '<img class="book-cover-img" src="' . e($coverRel . '?v=' . (int)@filemtime(__DIR__ . '/' . $coverRel)) . '" alt="'
        . e($L('جلد کتاب ' . $title, 'Cover of ' . $title)) . '" loading="eager">';
} else {
    $hue = (int)(abs(crc32((string)$book['id'])) % 360);
    $coverHtml = '<div class="book-cover" role="img" aria-label="' . e($L('جلد کتاب ' . $title, 'Cover of ' . $title)) . '" style="--cover-hue:' . $hue . '">'
        . '<span class="book-cover-title">' . e($title) . '</span></div>';
}

$price = isset($book['totalPrice']) ? (int)$book['totalPrice'] : 0;
$priceHtml = $price > 0
    ? '<div class="price-box-simple book-price"><span class="price-label">' . e($L('قیمت کل:', 'Total Price:')) . '</span>'
        . '<span class="price-val">' . e(number_format($price)) . ' ' . e($L('تومان', 'Toman')) . '</span></div>'
    : '';

// دکمه‌ها: ذخیره / مطالعه‌ی نمونه / خرید (همون تابع‌های صفحه‌ی نویسنده؛ ورود، سبد و خواندن)
$actions = '<div class="card-actions book-actions">'
    . '<button type="button" class="btn-read" id="bookSaveBtn" onclick="toggleSaveBook(\'' . $bidJs . '\')">' . e($L('🔖 ذخیره', '🔖 Save')) . '</button>'
    . '<button type="button" class="btn-read" onclick="openReader(\'' . $bidJs . '\')">' . e($L('مطالعه نمونه', 'Read Sample')) . '</button>'
    . '<button type="button" class="btn-buy" onclick="addToCart(\'' . $bidJs . '\')">' . e($L('خرید کتاب', 'Buy Book')) . '</button>'
    . '</div>';

// توضیحات سئو: خلاصه + معرفی کامل
$aboutHtml = '';
if ($desc !== '' || $bio !== '') {
    $aboutHtml = '<section class="book-about"><h2 class="author-faq-heading">'
        . e($L('📖 درباره‌ی کتاب «' . $title . '»', '📖 About “' . $title . '”')) . '</h2>'
        . ($desc !== '' ? '<p class="book-lead">' . e($desc) . '</p>' : '')
        . ($bio !== '' ? '<div class="author-page-bio book-bio">' . bio_to_html($bio) . '</div>' : '')
        . '</section>';
}

$main = '<nav class="author-breadcrumb" aria-label="' . e($L('مسیر صفحه', 'Breadcrumb')) . '">' . $crumbHtml . '</nav>'
    . '<article class="book-product" id="bookProduct" data-book-id="' . $bidJs . '" data-doc-title="' . e($pageTitle) . '">'
    . '<div class="book-product-top">'
    . '<div class="book-visuals">' . $coverHtml . '</div>'
    . '<div class="book-product-info"><h1 class="author-page-name book-title">' . e($title) . '</h1>' . $priceHtml . $actions . '</div>'
    . '</div>' . $aboutHtml . '</article>';

// ---- پر کردن قالب کامل صفحه (محتوای اصلی بین دو نشانه جایگزین می‌شود) ----
$template = file_get_contents(__DIR__ . '/templates/author-template.html');
$s = strpos($template, '<!--MAIN_START-->');
$en = strpos($template, '<!--MAIN_END-->');
if ($s === false || $en === false || $en < $s) {
    fail_page(500, 'قالب صفحه ناقص است', 'نشانه‌های MAIN_START / MAIN_END در templates/author-template.html پیدا نشد.');
}
$pre = substr($template, 0, $s);
$post = substr($template, $en + strlen('<!--MAIN_END-->'));

$altFile = book_page_file($book, $isEn ? 'fa' : 'en');
$replace = array(
    '{{SEO_HEAD}}' => $head,
    '{{SITE_NAME}}' => e($siteName),
    '{{CSS_HREF}}' => asset_href('assets/author.css'),
    '{{JS_HREF}}' => asset_href('assets/app-author.js'),
    '{{LANG}}' => $lang,
    '{{DIR}}' => $isEn ? 'ltr' : 'rtl',
    '{{BODY_CLASS}}' => $isEn ? 'en-mode' : '',
    '{{HOME_HREF}}' => $homeHref,
    '{{PAGE_LANG_JSON}}' => json_encode($lang),
    '{{ALT_URL_JSON}}' => json_encode($altFile),
    '{{NAME_FA_JSON}}' => json_encode(($author !== null && isset($author['name']['fa'])) ? $author['name']['fa'] : $siteNameFa, JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_APOS),
    '{{NAME_EN_JSON}}' => json_encode(($author !== null && isset($author['name']['en'])) ? $author['name']['en'] : $siteNameEn, JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_APOS),
    '{{AUTHORS_JSON}}' => authors_public_json($authors),
    '{{FEATURED_JSON}}' => featured_public_json(),
    '{{BOOKS_JSON}}' => books_public_json($books),
    '{{GENRE_GROUPS_JSON}}' => json_encode(all_genre_groups(), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG),
);
// قبل و بعد از محتوای اصلی جدا جایگزین می‌شوند (تا متن کتاب هرگز به‌عنوان نشانه‌ی قالب خوانده نشود)
header('Content-Type: text/html; charset=utf-8');
echo strtr($pre, $replace) . $main . strtr($post, $replace);
