<?php
// ارسال PDF کتاب فقط به کاربری که آن کتاب را خریده است.
// فراخوانی: fetch('read-pdf.php?id=19', {headers: {Authorization: 'Bearer <توکن Supabase>'}})
// مراحل: ۱) توکن با Supabase Auth تأیید می‌شود  ۲) با همان توکن (و قفل RLS) فهرست کتاب‌های خریداری‌شده‌ی خودِ کاربر خوانده می‌شود
//        ۳) اگر کتاب در فهرست بود، فایل از data/pdfs فرستاده می‌شود (آن پوشه مستقیم از مرورگر بسته است).
const RP_SUPABASE_URL = 'https://rpvpzhyxngxqztjcwcss.supabase.co';
const RP_SUPABASE_KEY = 'sb_publishable_ABJrLcMuFU-OSB0_BHWrRw_cNufmDC0'; // کلید عمومی (همان که در صفحه هم هست)

function rp_fail($code, $msg) {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode(array('ok' => false, 'msg' => $msg), JSON_UNESCAPED_UNICODE);
    exit;
}

function rp_supa_get($path, $token) {
    $url = RP_SUPABASE_URL . $path;
    $hdr = array('apikey: ' . RP_SUPABASE_KEY, 'Authorization: Bearer ' . $token, 'Accept: application/json');
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, array(CURLOPT_RETURNTRANSFER => true, CURLOPT_HTTPHEADER => $hdr, CURLOPT_TIMEOUT => 15));
        // روی XAMPP ویندوز معمولاً فایل گواهی (CA) تنظیم نیست؛ اگر خطای SSL دادی، مسیر cacert.pem را در php.ini (curl.cainfo) بگذار.
        $body = curl_exec($ch);
        $st = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
    } else {
        $ctx = stream_context_create(array('http' => array('method' => 'GET', 'header' => implode("\r\n", $hdr), 'timeout' => 15, 'ignore_errors' => true)));
        $body = @file_get_contents($url, false, $ctx);
        $st = 0;
        if (isset($http_response_header[0]) && preg_match('/\s(\d{3})\s/', $http_response_header[0], $m)) $st = (int)$m[1];
    }
    if ($body === false || $body === null) return array(0, null);
    return array($st, json_decode($body, true));
}

$id = isset($_GET['id']) ? (string)$_GET['id'] : '';
if ($id === '' || !preg_match('/^[\w-]{1,40}$/', $id)) rp_fail(400, 'شناسه‌ی کتاب نامعتبر است.');

$auth = isset($_SERVER['HTTP_AUTHORIZATION']) ? $_SERVER['HTTP_AUTHORIZATION'] : (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION']) ? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] : '');
if ($auth === '' && function_exists('apache_request_headers')) {
    foreach (apache_request_headers() as $k => $v) if (strtolower($k) === 'authorization') $auth = $v;
}
$token = preg_match('/^Bearer\s+([\w\-.]+)$/', trim($auth), $m) ? $m[1] : '';
if ($token === '') rp_fail(401, 'برای مطالعه باید وارد حساب کاربری شوید.');

// ۱) تأیید توکن (نتیجه‌ی موفق تا ۱۰ دقیقه کش می‌شود تا هر بار منتظر Supabase نمانیم؛ کش فقط بعد از تأییدِ خودِ Supabase ساخته می‌شود)
$cacheFile = sys_get_temp_dir() . '/pdfm_tok_' . hash('sha256', $token);
$u = null;
if (is_file($cacheFile)) {
    $c = json_decode((string)@file_get_contents($cacheFile), true);
    if (is_array($c) && !empty($c['id']) && !empty($c['until']) && $c['until'] > time()) $u = array('id' => $c['id']);
    else @unlink($cacheFile);
}
if ($u === null) {
    list($st, $u) = rp_supa_get('/auth/v1/user', $token);
    if ($st === 0) rp_fail(502, 'اتصال سرور به Supabase برقرار نشد (اینترنت/گواهی SSL سرور را بررسی کن).');
    if ($st !== 200 || empty($u['id'])) rp_fail(401, 'نشست شما منقضی شده؛ دوباره وارد شوید.');
    $until = time() + 600;
    $parts = explode('.', $token);
    if (count($parts) === 3) {
        $pl = json_decode((string)base64_decode(strtr($parts[1], '-_', '+/')), true);
        if (is_array($pl) && !empty($pl['exp'])) $until = min($until, (int)$pl['exp']);
    }
    if ($until > time()) @file_put_contents($cacheFile, json_encode(array('id' => $u['id'], 'until' => $until)), LOCK_EX);
}

// ۲) کتاب‌های خریداری‌شده‌ی همین کاربر
// فعلاً خریدها فقط در localStorage مرورگر ذخیره می‌شوند (نه Supabase)، پس سرور نمی‌تواند خرید را تأیید کند.
// تا وقتی درگاه پرداخت و ثبت خرید روی سرور آماده نشده، true بماند (فقط «ورود کاربر» چک می‌شود).
// قبل از فروش واقعی حتماً false شود (و خرید در Supabase ثبت شود)، وگرنه هر کاربرِ واردشده می‌تواند PDF هر کتابی را بگیرد.
const RP_TEST_MODE = false;
if (!RP_TEST_MODE) {
    list($st2, $rows) = rp_supa_get('/rest/v1/users?select=purchased_books&auth_user_id=eq.' . rawurlencode($u['id']) . '&limit=1', $token);
    if ($st2 !== 200 || !is_array($rows)) rp_fail(502, 'خواندن اطلاعات خرید ممکن نشد.');
    $owned = false;
    if (!empty($rows[0]['purchased_books']) && is_array($rows[0]['purchased_books'])) {
        foreach ($rows[0]['purchased_books'] as $pb) if (is_array($pb) && isset($pb['id']) && (string)$pb['id'] === $id) { $owned = true; break; }
    }
    if (!$owned) rp_fail(403, 'این کتاب در فهرست خریدهای شما نیست.');
}

// ۳) فایل PDF
$raw = @file_get_contents(__DIR__ . '/data/books.json');
if ($raw !== false && substr($raw, 0, 3) === "\xEF\xBB\xBF") $raw = substr($raw, 3);
$books = $raw ? json_decode($raw, true) : array();
$file = '';
if (is_array($books)) foreach ($books as $b) if (is_array($b) && (string)($b['id'] ?? '') === $id) { $file = (string)($b['pdf']['file'] ?? ''); break; }
if (!preg_match('/^b[\w-]+-[a-f0-9]{12}\.pdf$/', $file) || !is_file(__DIR__ . '/data/pdfs/' . $file)) rp_fail(404, 'فایل PDF این کتاب هنوز آپلود نشده است.');
$path = __DIR__ . '/data/pdfs/' . $file;

while (ob_get_level()) ob_end_clean();
header('Content-Type: application/pdf');
header('Content-Length: ' . filesize($path));
header('Content-Disposition: inline; filename="book-' . preg_replace('/\D/', '', $id) . '.pdf"');
header('Cache-Control: private, no-store');
header('X-Content-Type-Options: nosniff');
readfile($path);
