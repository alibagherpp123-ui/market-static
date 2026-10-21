<?php
// robots.txt: به موتورهای جستجو اجازه‌ی دیدن سایت رو می‌ده و آدرس نقشه‌ی سایت رو بهشون می‌گه.
require_once __DIR__ . '/lib.php';

$settings = load_data('settings');
$base = site_url($settings['data']);
$ready = seo_urls_ready($settings['data']);

header('Content-Type: text/plain; charset=utf-8');
echo "User-agent: *\n";
echo "Allow: /\n";
echo "Disallow: /admin.php\n";
echo "Disallow: /admin-config.php\n";
echo "\n";
if ($ready) echo "Sitemap: " . $base . "/sitemap.xml\n";
