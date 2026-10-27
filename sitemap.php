<?php
// نقشه‌ی سایت برای گوگل: خودکار از روی data/authors.json ساخته می‌شه.
// آدرس: sitemap.xml  (توسط .htaccess به این فایل وصل می‌شه)
// هر صفحه نسخه‌ی فارسی و انگلیسی دارد و به هم معرفی می‌شوند (hreflang).
// هر نسخه (فارسی/انگلیسی) فقط وقتی می‌آید که اسم، بیو، ملیت و ژانرِ همان زبان واقعی باشد.
require_once __DIR__ . '/lib.php';

$authors = load_data('authors');
$booksFile = load_data('books');
$settings = load_data('settings');
if (!seo_urls_ready($settings['data'])) {
    http_response_code(503);
    header('Content-Type: text/plain; charset=utf-8');
    echo "نقشه‌ی سایت هنوز غیرفعال است: اول آدرس سایت را در data/settings.json بنویس (siteUrl) .\n";
    echo "Sitemap disabled: set \"siteUrl\" in data/settings.json (requireSiteUrl is on).\n";
    exit;
}
$base = site_url($settings['data']);
$lastmod = date('Y-m-d', filemtime(__DIR__ . '/data/authors.json'));

// یک آدرس با لینک‌های جایگزین زبان‌ها
function sm_url($loc, $alts, $lastmod = '') {
    $o = "  <url><loc>" . e($loc) . "</loc>" . ($lastmod !== '' ? "<lastmod>" . $lastmod . "</lastmod>" : '');
    foreach ($alts as $hl => $href) {
        $o .= '<xhtml:link rel="alternate" hreflang="' . $hl . '" href="' . e($href) . '"/>';
    }
    return $o . "</url>\n";
}

header('Content-Type: application/xml; charset=utf-8');
echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">' . "\n";

$hFa = home_page_url($base, 'fa');
$hEn = home_page_url($base, 'en');
$homeAlts = array('fa' => $hFa, 'en' => $hEn, 'x-default' => $hFa);
echo sm_url($hFa, $homeAlts);
echo sm_url($hEn, $homeAlts);

foreach ($authors['data'] as $a) {
    if (empty($a['slug'])) continue;
    $fa = author_page_url($base, $a['slug'], 'fa');
    $en = author_page_url($base, $a['slug'], 'en');
    $faOk = author_fa_ready($a);
    $enOk = author_en_ready($a);
    // هر زبان فقط وقتی کامل است در نقشه می‌آید؛ hreflang فقط وقتی هر دو کامل‌اند
    if ($faOk && $enOk) {
        $alts = array('fa' => $fa, 'en' => $en, 'x-default' => $fa);
        echo sm_url($fa, $alts, $lastmod);
        echo sm_url($en, $alts, $lastmod);
    } elseif ($faOk) {
        echo sm_url($fa, array(), $lastmod);
    } elseif ($enOk) {
        echo sm_url($en, array(), $lastmod);
    }
}
// صفحه‌ی مستقل کتاب‌ها (فقط کتاب‌هایی که متن واقعی و حجم کافی دارند)
$booksLastmod = date('Y-m-d', filemtime(__DIR__ . '/data/books.json'));
foreach ($booksFile['data'] as $b) {
    if (!is_array($b) || empty($b['authorId']) || find_author_by_id($authors['data'], $b['authorId']) === null) continue;
    $fa = book_page_url($base, $b, 'fa');
    $en = book_page_url($base, $b, 'en');
    $faOk = book_indexable($b, 'fa');
    $enOk = book_indexable($b, 'en');
    if ($faOk && $enOk) {
        $alts = array('fa' => $fa, 'en' => $en, 'x-default' => $fa);
        echo sm_url($fa, $alts, $booksLastmod);
        echo sm_url($en, $alts, $booksLastmod);
    } elseif ($faOk) {
        echo sm_url($fa, array(), $booksLastmod);
    } elseif ($enOk) {
        echo sm_url($en, array(), $booksLastmod);
    }
}
// صفحه‌های فیلتر (پرفروش‌ها، جدیدترین‌ها، تخفیفات، دسته‌ها) در هر دو زبان
$filtersLastmod = date('Y-m-d');
foreach (filter_pages() as $key => $p) {
    $fa = filter_url($base, $key, 'fa');
    $en = filter_url($base, $key, 'en');
    $alts = array('fa' => $fa, 'en' => $en, 'x-default' => $fa);
    echo sm_url($fa, $alts, $filtersLastmod);
    echo sm_url($en, $alts, $filtersLastmod);
}
// ترکیب دو فیلتر (مثلاً ادبیات + یک ناشر): فقط ترکیب‌هایی که حداقل ۳ کتاب دارند
$comboMin = 3;
$comboLastmod = date('Y-m-d');
$faIx = combo_index('fa');
$enIx = combo_index('en');
$comboKeys = array_unique(array_merge(array_keys($faIx['pairs']), array_keys($enIx['pairs'])));
foreach ($comboKeys as $k) {
    $ids = explode("\n", $k);
    $faCount = isset($faIx['pairs'][$k]) ? $faIx['pairs'][$k] : 0;
    $enCount = isset($enIx['pairs'][$k]) ? $enIx['pairs'][$k] : 0;
    $fa = ($faCount >= $comboMin) ? combo_url($base, 'fa', $ids) : null;
    $en = ($enCount >= $comboMin) ? combo_url($base, 'en', $ids) : null;
    if ($fa !== null && $en !== null) {
        $alts = array('fa' => $fa, 'en' => $en, 'x-default' => $fa);
        echo sm_url($fa, $alts, $comboLastmod);
        echo sm_url($en, $alts, $comboLastmod);
    } elseif ($fa !== null) {
        echo sm_url($fa, array(), $comboLastmod);
    } elseif ($en !== null) {
        echo sm_url($en, array(), $comboLastmod);
    }
}
echo "</urlset>\n";
