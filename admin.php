<?php
// ============================================================
// پنل ادمین سایت
//   • نویسنده‌ها: افزودن / ویرایش / حذف (آدرس: admin.php)
//       فقط data/authors.json و پوشه‌ی images/authors را تغییر می‌دهد.
//   • کاربران: تایید/رد عکس اختصاصی آواتار و ارسال پیام به کاربر (آدرس: admin.php?a=users)
//       منطق آن در admin-users.js است (جایگزین «پنل ادمین (تست)» که قبلاً داخل index.html بود).
// ============================================================
if (PHP_VERSION_ID >= 70300) {
    session_set_cookie_params(array('lifetime' => 0, 'path' => '/', 'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off', 'httponly' => true, 'samesite' => 'Lax'));
} else {
    ini_set('session.cookie_httponly', '1');
}
session_start();
require_once __DIR__ . '/admin-config.php';
require_once __DIR__ . '/lib.php';
require_once __DIR__ . '/pdf-check.php';       // بررسی چندمرحله‌ای PDF
require_once __DIR__ . '/admin-feedback.php';  // toast، پیش‌نمایش عکس، پیش‌نویس خودکار، میانبرها
require_once __DIR__ . '/admin-history.php';   // لاگ تغییرات و پیش‌نمایش تفاوت پشتیبان (بخش ۶)
require_once __DIR__ . '/admin-featured.php';  // کادر چهره‌ها (عکس نویسنده‌ها در صفحه‌ی اصلی)
require_once __DIR__ . '/admin-content.php';   // جستجو/فیلتر/صفحه‌بندی، کتاب‌ها، تکثیر، ویرایش گروهی، CSV
require_once __DIR__ . '/admin-storage.php';   // ذخیره‌ی گروهی و حذف امن PDF بعد از موفقیت

header('X-Robots-Tag: noindex, nofollow');
header('Cache-Control: no-store');

const AUTHORS_FILE = __DIR__ . '/data/authors.json';
const BOOKS_FILE   = __DIR__ . '/data/books.json';
const PHOTO_DIR    = __DIR__ . '/images/authors';
const BACKUP_DIR   = __DIR__ . '/data/backups';

const GENRES_FILE  = __DIR__ . '/data/genres.json';

// Genre groups = built-in genres + genres added from this panel (data/genres.json)
$GENRE_GROUPS = array();
foreach (all_genre_groups() as $gk => $gv) $GENRE_GROUPS[$gk] = $gv['fa'];

// ---------- ابزارها ----------
function csrf_token() {
    if (empty($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(16));
    return $_SESSION['csrf'];
}
function csrf_ok() {
    return isset($_POST['csrf'], $_SESSION['csrf']) && hash_equals($_SESSION['csrf'], (string)$_POST['csrf']);
}
function flash($type, $msg) { $_SESSION['flash'] = array($type, $msg); }
function redirect($to) { pdf_finish_changes(false); header('Location: ' . $to); exit; }
function post($k) { return isset($_POST[$k]) && is_string($_POST[$k]) ? trim($_POST[$k]) : ''; }

function fa_digits_to_en($s) {
    return strtr($s, array('۰'=>'0','۱'=>'1','۲'=>'2','۳'=>'3','۴'=>'4','۵'=>'5','۶'=>'6','۷'=>'7','۸'=>'8','۹'=>'9',
                           '٠'=>'0','١'=>'1','٢'=>'2','٣'=>'3','٤'=>'4','٥'=>'5','٦'=>'6','٧'=>'7','٨'=>'8','٩'=>'9'));
}

function read_authors() {
    if (!file_exists(AUTHORS_FILE)) return array();
    $raw = file_get_contents(AUTHORS_FILE);
    if (substr($raw, 0, 3) === "\xEF\xBB\xBF") $raw = substr($raw, 3);
    $d = json_decode($raw, true);
    if (!is_array($d)) die('<meta charset="utf-8"><p dir="rtl">فایل data/authors.json خراب است: ' . htmlspecialchars(json_last_error_msg()) . ' — <a href="admin.php?a=security">بازگردانی از نسخه‌ی پشتیبان</a></p>');
    return $d;
}

// ذخیره‌ی امن: اول نسخه‌ی پشتیبان، بعد نوشتن در فایل موقت و جایگزینی
function save_authors($list) {
    return save_content_batch(array(AUTHORS_FILE => array('kind' => 'authors', 'data' => array_values($list))));
}

// Safe save of a JSON file (with backup copy)
function save_json_file($path, $prefix, $data) {
    return save_content_batch(array($path => array('kind' => $prefix, 'data' => $data)));
}

function read_books() {
    if (!file_exists(BOOKS_FILE)) return array();
    $raw = file_get_contents(BOOKS_FILE);
    if (substr($raw, 0, 3) === "\xEF\xBB\xBF") $raw = substr($raw, 3);
    $d = json_decode($raw, true);
    if (!is_array($d)) die('data/books.json is broken: ' . json_last_error_msg());
    return $d;
}
function save_books($list) { return save_json_file(BOOKS_FILE, 'books', array_values($list)); }

function save_custom_genre($key, $g) {
    $cur = custom_genre_groups();
    $cur[$key] = $g;
    return save_json_file(GENRES_FILE, 'genres', $cur);
}

function next_book_id($list) {
    $max = 0;
    foreach ($list as $b) if (isset($b['id']) && ctype_digit((string)$b['id'])) $max = max($max, (int)$b['id']);
    return (string)($max + 1);
}

function next_author_id($list) {
    $max = 0;
    foreach ($list as $a) {
        if (isset($a['id']) && preg_match('/^au(\d+)$/', $a['id'], $m)) $max = max($max, (int)$m[1]);
    }
    return 'au' . ($max + 1);
}

function books_count($authorId) {
    if (!file_exists(BOOKS_FILE)) return 0;
    $d = json_decode(file_get_contents(BOOKS_FILE), true);
    $n = 0;
    if (is_array($d)) foreach ($d as $b) if (isset($b['authorId']) && $b['authorId'] === $authorId) $n++;
    return $n;
}

// آدرس صفحه (slug) را خودکار مرتب می‌کند: حروف بزرگ ← کوچک، فاصله و _ ← خط تیره، هر چیز غیرمجاز حذف می‌شود
function slug_normalize($s) {
    $s = strtolower(trim((string)$s));
    $s = preg_replace('/[\s_]+/', '-', $s);
    $s = preg_replace('/[^a-z0-9-]/', '', $s);
    $s = preg_replace('/-+/', '-', $s);
    return trim($s, '-');
}

function find_photo($slug) {
    foreach (array('jpg', 'jpeg', 'png', 'webp') as $ext) {
        if (file_exists(PHOTO_DIR . '/' . $slug . '.' . $ext)) return 'images/authors/' . $slug . '.' . $ext;
    }
    return '';
}

// آپلود عکس: فقط jpg/png/webp واقعی، حداکثر ۲۵ مگابایت.
// اگر افزونه‌ی GD در PHP فعال باشد، عکس خودکار کوچک و بهینه (JPG) می‌شود و نسخه‌ی اصلی در data/photo-originals نگه داشته می‌شود.
// اگر GD فعال نباشد، مثل قبل (حداکثر ۵ مگابایت) همان فایل ذخیره می‌شود.
// خروجی: مسیر نسبی یا رشته‌ی خطا (با پیشوند !)
const PHOTO_MAX_MB       = 25;
const PHOTO_RAW_MAX_MB   = 5;      // سقف حجم وقتی کوچک‌سازی ممکن نباشد
const PHOTO_MAX_SIDE     = 1200;   // بلندترین ضلع بعد از کوچک‌سازی (پیکسل)؛ عکس کوچک‌تر بزرگ نمی‌شود
const PHOTO_JPEG_QUALITY = 86;
const PHOTO_ORIG_DIR     = __DIR__ . '/data/photo-originals';

// عکس را کوچک می‌کند و به صورت JPG در $dest می‌نویسد. موفق: true. اگر مشکلی بود، متن دلیلش را برمی‌گرداند (و چیزی تغییر نمی‌کند).
function photo_optimize($src, $type, $dest) {
    if (!extension_loaded('gd') || !function_exists('imagecreatetruecolor') || !function_exists('imagejpeg')) return 'افزونه‌ی GD در PHP فعال نیست';
    $info = @getimagesize($src);
    if (!$info) return 'فایل عکس خوانده نشد';
    $w = (int)$info[0]; $h = (int)$info[1];
    if ($w < 1 || $h < 1 || $w * $h > 120000000) return 'ابعاد عکس بیش از حد بزرگ است'; // بیش از ۱۲۰ مگاپیکسل: حافظه‌ی سرور کم می‌آورد
    @ini_set('memory_limit', '768M');
    $im = false;
    if ($type === IMAGETYPE_JPEG) {
        if (!function_exists('imagecreatefromjpeg')) return 'GD از JPG پشتیبانی نمی‌کند';
        $im = @imagecreatefromjpeg($src);
    } elseif ($type === IMAGETYPE_PNG) {
        if (!function_exists('imagecreatefrompng')) return 'GD از PNG پشتیبانی نمی‌کند';
        $im = @imagecreatefrompng($src);
    } elseif ($type === IMAGETYPE_WEBP) {
        if (!function_exists('imagecreatefromwebp')) return 'GD از WEBP پشتیبانی نمی‌کند؛ عکس را JPG یا PNG آپلود کن';
        $im = @imagecreatefromwebp($src);
    }
    if (!$im) return 'باز کردن عکس ناموفق بود (احتمالاً حافظه‌ی PHP کم است؛ memory_limit فعلی: ' . ini_get('memory_limit') . ')';
    // عکس‌های گوشی گاهی با «چرخش EXIF» ذخیره می‌شن؛ اینجا درستش می‌کنیم تا عکس خوابیده نشه
    if ($type === IMAGETYPE_JPEG && function_exists('exif_read_data') && function_exists('imagerotate')) {
        $ex = @exif_read_data($src);
        $o = (is_array($ex) && isset($ex['Orientation'])) ? (int)$ex['Orientation'] : 1;
        $rot = 0;
        if ($o === 3) $rot = 180; elseif ($o === 6) $rot = -90; elseif ($o === 8) $rot = 90;
        if ($rot !== 0) {
            $r = @imagerotate($im, $rot, 0);
            if ($r) { imagedestroy($im); $im = $r; }
        }
    }
    if (!imageistruecolor($im) && function_exists('imagepalettetotruecolor')) @imagepalettetotruecolor($im);
    $w = imagesx($im); $h = imagesy($im);
    $scale = min(1.0, PHOTO_MAX_SIDE / max($w, $h));
    $nw = max(1, (int)round($w * $scale));
    $nh = max(1, (int)round($h * $scale));
    $out = imagecreatetruecolor($nw, $nh);
    imagefill($out, 0, 0, imagecolorallocate($out, 255, 255, 255)); // پس‌زمینه‌ی سفید برای PNG شفاف
    imagecopyresampled($out, $im, 0, 0, 0, 0, $nw, $nh, $w, $h);
    imagedestroy($im);
    imageinterlace($out, true); // JPG پیش‌رونده: روی اینترنت کند سریع‌تر دیده می‌شود
    $tmp = $dest . '.tmp';
    $ok = @imagejpeg($out, $tmp, PHOTO_JPEG_QUALITY);
    imagedestroy($out);
    if (!$ok || !is_file($tmp) || filesize($tmp) < 100) { @unlink($tmp); return 'ذخیره‌ی عکس کوچک‌شده ممکن نشد (دسترسی نوشتن پوشه‌ی images/authors را بررسی کن)'; }
    if (!@rename($tmp, $dest)) { @unlink($tmp); return 'جایگزین کردن فایل عکس ممکن نشد (دسترسی نوشتن)'; }
    return true;
}

// اگر مرورگر عکس را خودش کوچک کرده باشد، نسخه‌ی اصلیِ بزرگ از راه آپلود تکه‌تکه می‌رسد (photo_orig_token)؛ اینجا در data/photo-originals نگه داشته می‌شود
function photo_keep_original($slug) {
    $t = post('photo_orig_token');
    if ($t === '') return;
    $c = chunk_get($t, 'photo');
    if (!is_array($c)) return;
    $info = @getimagesize($c['path']);
    $map = array(IMAGETYPE_JPEG => 'jpg', IMAGETYPE_PNG => 'png', IMAGETYPE_WEBP => 'webp');
    if ($info && isset($map[$info[2]])) {
        if (!is_dir(PHOTO_ORIG_DIR)) @mkdir(PHOTO_ORIG_DIR, 0755, true);
        if (is_dir(PHOTO_ORIG_DIR)) {
            if (!file_exists(PHOTO_ORIG_DIR . '/.htaccess')) @file_put_contents(PHOTO_ORIG_DIR . '/.htaccess', "Require all denied\nOptions -Indexes\n");
            foreach (array('jpg', 'jpeg', 'png', 'webp') as $e) @unlink(PHOTO_ORIG_DIR . '/' . $slug . '.' . $e);
            if (chunk_move($c['path'], PHOTO_ORIG_DIR . '/' . $slug . '.' . $map[$info[2]])) { chunk_forget($t); return; }
        }
    }
    chunk_forget($t, true);
}
function handle_photo_upload($slug) {
    $r = handle_photo_upload_core($slug);
    if ($r !== '' && $r[0] !== '!') photo_keep_original($slug);
    return $r;
}
function handle_photo_upload_core($slug) {
    if (empty($_FILES['photo']) || $_FILES['photo']['error'] === UPLOAD_ERR_NO_FILE) return '';
    $f = $_FILES['photo'];
    if ($slug === '' || !preg_match('/^[a-z0-9]+(-[a-z0-9]+)*$/', $slug)) return '!برای آپلود عکس، اول آدرس انگلیسی (slug) نویسنده را بنویس.';
    if ($f['error'] !== UPLOAD_ERR_OK) return '!آپلود عکس ناموفق بود (کد ' . $f['error'] . '). شاید حجم از حد سرور بیشتر است.';
    if ($f['size'] > PHOTO_MAX_MB * 1024 * 1024) return '!حجم عکس بیشتر از ' . PHOTO_MAX_MB . ' مگابایت است.';
    $info = @getimagesize($f['tmp_name']);
    $map = array(IMAGETYPE_JPEG => 'jpg', IMAGETYPE_PNG => 'png', IMAGETYPE_WEBP => 'webp');
    if (!$info || !isset($map[$info[2]])) return '!فرمت عکس باید JPG، PNG یا WEBP باشد.';
    $ext = $map[$info[2]];
    if (!is_dir(PHOTO_DIR)) @mkdir(PHOTO_DIR, 0755, true);

    // عکسی که از قبل کوچک و سبک است (JPG زیر ۳۰۰ کیلوبایت و حداکثر ۱۲۰۰ پیکسل) دوباره فشرده نمی‌شود تا کیفیتش کم نشود
    // عکسی که مرورگر خودش کوچک کرده (photo_client_opt=1، حداکثر ۳ مگابایت) هم دوباره فشرده نمی‌شود
    $alreadySmall = ($info[2] === IMAGETYPE_JPEG && max((int)$info[0], (int)$info[1]) <= PHOTO_MAX_SIDE
        && ($f['size'] <= 300 * 1024 || (post('photo_client_opt') === '1' && $f['size'] <= 3 * 1024 * 1024)));
    if (!$alreadySmall) {
        $dest = PHOTO_DIR . '/' . $slug . '.jpg';
        $optRes = photo_optimize($f['tmp_name'], $info[2], $dest);
        if ($optRes === true) {
            // نسخه‌ی اصلی را جدا و بسته (بدون دسترسی مستقیم از مرورگر) نگه می‌داریم
            if (!is_dir(PHOTO_ORIG_DIR)) @mkdir(PHOTO_ORIG_DIR, 0755, true);
            if (is_dir(PHOTO_ORIG_DIR)) {
                if (!file_exists(PHOTO_ORIG_DIR . '/.htaccess')) @file_put_contents(PHOTO_ORIG_DIR . '/.htaccess', "Require all denied\nOptions -Indexes\n");
                foreach (array('jpg', 'jpeg', 'png', 'webp') as $e) @unlink(PHOTO_ORIG_DIR . '/' . $slug . '.' . $e);
                @copy($f['tmp_name'], PHOTO_ORIG_DIR . '/' . $slug . '.' . $ext);
            }
            foreach (array('jpeg', 'png', 'webp') as $e) @unlink(PHOTO_DIR . '/' . $slug . '.' . $e); // حذف عکس قبلیِ فرمت‌های دیگر
            return 'images/authors/' . $slug . '.jpg';
        }
        // کوچک‌سازی ممکن نشد (مثلاً GD فعال نیست): فقط اگر حجم کم است همان فایل را ذخیره می‌کنیم
        if ($f['size'] > PHOTO_RAW_MAX_MB * 1024 * 1024) {
            return '!کوچک‌سازی عکس ممکن نشد — دلیل: ' . $optRes . ' — و حجم عکس بیشتر از ' . PHOTO_RAW_MAX_MB . ' مگابایت است. عکس را کوچک‌تر کن و دوباره آپلود کن.';
        }
    }
    foreach (array('jpg', 'jpeg', 'png', 'webp') as $e) @unlink(PHOTO_DIR . '/' . $slug . '.' . $e); // حذف عکس قبلی
    if (!move_uploaded_file($f['tmp_name'], PHOTO_DIR . '/' . $slug . '.' . $ext)) return '!ذخیره‌ی عکس ممکن نشد. دسترسی نوشتن پوشه‌ی images/authors را بررسی کن.';
    return 'images/authors/' . $slug . '.' . $ext;
}

// ---------- فایل PDF کتاب ----------
// فایل‌ها در data/pdfs ذخیره می‌شوند (دسترسی مستقیم از مرورگر بسته است)؛ دانلود فقط با ورود ادمین: admin.php?a=pdf_get&id=..
const PDF_DIR = __DIR__ . '/data/pdfs';
const PDF_MAX_MB = 0;   // 0 = بدون سقف حجم در کد سایت (فقط فضای خالی هاست مهم است). اگر خواستی سقف بگذاری، مثلاً 500 بنویس.

// ---------- آپلود تکه‌تکه (chunked) ----------
// مرورگر فایل بزرگ را به تکه‌های کوچک (حدود ۱ مگابایت) می‌شکند و یکی‌یکی می‌فرستد؛ سرور تکه‌ها را به هم می‌چسباند.
// به همین خاطر محدودیت upload_max_filesize / post_max_size هاست (مثلاً ۲ مگابایت) دیگر مانع آپلود نیست.
const CHUNK_DIR = __DIR__ . '/data/chunks';

function chunk_dir_ready() {
    if (!is_dir(CHUNK_DIR) && !@mkdir(CHUNK_DIR, 0755, true)) return false;
    if (!file_exists(CHUNK_DIR . '/.htaccess')) @file_put_contents(CHUNK_DIR . '/.htaccess', "Require all denied\nOptions -Indexes\n");
    if (!file_exists(CHUNK_DIR . '/index.html')) @file_put_contents(CHUNK_DIR . '/index.html', '');
    return true;
}
function chunk_part_path($token) {
    return (is_string($token) && preg_match('/^[a-f0-9]{24}$/', $token)) ? CHUNK_DIR . '/' . $token . '.part' : null;
}
function chunk_json($arr) {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($arr, JSON_UNESCAPED_UNICODE);
    exit;
}
// تکه‌های نیمه‌کاره‌ی قدیمی (بیش از ۶ ساعت) پاک می‌شوند
function chunk_cleanup_stale() {
    foreach (glob(CHUNK_DIR . '/*.part') ?: array() as $f) {
        if (@filemtime($f) < time() - 6 * 3600) @unlink($f);
    }
}
// فایل کاملِ آپلودشده با توکن: آرایه‌ی path/name/size یا متن خطا
function chunk_get($token, $kind) {
    $p = chunk_part_path($token);
    $rec = ($p && isset($_SESSION['chunks'][$token])) ? $_SESSION['chunks'][$token] : null;
    if (!$rec || $rec['kind'] !== $kind) return 'فایل آپلودشده پیدا نشد؛ دوباره انتخابش کن.';
    clearstatcache(true, $p);
    if (!is_file($p) || filesize($p) !== (int)$rec['size']) return 'آپلود فایل کامل نشده بود؛ دوباره انتخابش کن و صبر کن نوار پیشرفت تمام شود.';
    return array('path' => $p, 'name' => $rec['name'], 'size' => (int)$rec['size']);
}
function chunk_forget($token, $deleteFile = false) {
    if ($deleteFile) { $p = chunk_part_path($token); if ($p) @unlink($p); }
    unset($_SESSION['chunks'][$token]);
}
// فایل کامل را به مقصد منتقل می‌کند (rename، و اگر نشد کپی)
function chunk_move($src, $dest) {
    if (@rename($src, $dest)) return true;
    if (@copy($src, $dest)) { @unlink($src); return true; }
    return false;
}

function human_size($b) {
    if ($b >= 1048576) return number_format($b / 1048576, 1) . ' MB';
    return number_format(max(1, $b / 1024), 0) . ' KB';
}
function pdf_dir_ready() {
    if (!is_dir(PDF_DIR) && !@mkdir(PDF_DIR, 0755, true)) return false;
    if (!file_exists(PDF_DIR . '/.htaccess')) @file_put_contents(PDF_DIR . '/.htaccess', "Require all denied\nOptions -Indexes\n");
    if (!file_exists(PDF_DIR . '/index.html')) @file_put_contents(PDF_DIR . '/index.html', '');
    return true;
}
function pdf_path($book) {
    $f = isset($book['pdf']['file']) ? (string)$book['pdf']['file'] : '';
    if (!preg_match('/^b[\w-]+-[a-f0-9]{12}\.pdf$/', $f)) return null;
    $p = PDF_DIR . '/' . $f;
    return is_file($p) ? $p : null;
}
function pdf_delete_file($book) { $p = pdf_path($book); if ($p) @unlink($p); }

// خروجی: '' = فایلی فرستاده نشده | '!خطا' | 'ok' (و $book['pdf'] تنظیم شد)
// فایل یا از راه آپلود تکه‌تکه می‌رسد (فیلد مخفی book_pdf_token) یا — اگر جاوااسکریپت کار نکرد — از راه آپلود معمولی.
function handle_pdf_upload($field, &$book) {
    $token = post($field . '_token');
    $viaChunk = ($token !== '');
    if ($viaChunk) {
        $c = chunk_get($token, 'pdf');
        if (!is_array($c)) return '!' . $c;
        $src = $c['path']; $fsize = $c['size']; $fname = $c['name'];
        if (PDF_MAX_MB > 0 && $fsize > PDF_MAX_MB * 1048576) { chunk_forget($token, true); return '!حجم PDF بیشتر از ' . PDF_MAX_MB . ' مگابایت است.'; }
    } else {
        if (empty($_FILES[$field]) || $_FILES[$field]['error'] === UPLOAD_ERR_NO_FILE) return '';
        $f = $_FILES[$field];
        if ($f['error'] === UPLOAD_ERR_INI_SIZE || $f['error'] === UPLOAD_ERR_FORM_SIZE)
            return '!حجم PDF از حد مجاز سرور بیشتر است (upload_max_filesize = ' . ini_get('upload_max_filesize') . '). صفحه را یک‌بار تازه (Refresh) کن و دوباره انتخاب کن تا از آپلود تکه‌تکه استفاده شود.';
        if ($f['error'] !== UPLOAD_ERR_OK) return '!آپلود PDF ناموفق بود (کد ' . $f['error'] . ').';
        if (PDF_MAX_MB > 0 && $f['size'] > PDF_MAX_MB * 1048576) return '!حجم PDF بیشتر از ' . PDF_MAX_MB . ' مگابایت است.';
        $src = $f['tmp_name']; $fsize = (int)$f['size']; $fname = (string)$f['name'];
    }
    // بررسی چندمرحله‌ای PDF (فایل pdf-check.php): سربرگ، انتها، xref، اسکن کل فایل، باز کردن streamهای فشرده
    $chk = pdf_check_file($src, $fsize);
    if ($chk !== '') { if ($viaChunk) chunk_forget($token, true); return '!' . $chk; }
    if (!pdf_dir_ready()) return '!ساخت پوشه‌ی data/pdfs ممکن نشد. دسترسی نوشتن را بررسی کن.';
    $name = 'b' . preg_replace('/[^\w-]/', '', (string)$book['id']) . '-' . bin2hex(random_bytes(6)) . '.pdf';
    $moved = $viaChunk ? chunk_move($src, PDF_DIR . '/' . $name) : move_uploaded_file($src, PDF_DIR . '/' . $name);
    if (!$moved) return '!ذخیره‌ی PDF ممکن نشد. دسترسی نوشتن پوشه‌ی data/pdfs را بررسی کن.';
    if ($viaChunk) chunk_forget($token);
    pdf_track_new(PDF_DIR . '/' . $name);
    pdf_defer_delete($book); // فایل قبلی فقط پس از ذخیره‌ی موفق داده‌ها حذف می‌شود
    $orig = preg_replace('/[\x00-\x1f"\\\\\/]/', '', $fname);
    $book['pdf'] = array('file' => $name, 'name' => $orig !== '' ? $orig : 'book.pdf', 'size' => (int)$fsize, 'at' => date('Y-m-d H:i'));
    return 'ok';
}
// حذف PDF اگر تیک «حذف» خورده باشد
function handle_pdf_remove(&$book) {
    if (post('pdf_remove') === '1' && !empty($book['pdf'])) { pdf_defer_delete($book); unset($book['pdf']); return true; }
    return false;
}
// ---------- نوع PDF: متنی / اسکن‌شده / ترکیبی / متن خراب ----------
// نتیجه‌ی تشخیص خودکار را مرورگر ادمین می‌فرستد (pdf_kind_auto، فایل assets/pdfjs/pdf-kind.js)؛ ادمین هم می‌تواند دستی تعیین کند (pdf_kind_pick).
// فقط برچسب کنار اطلاعات PDF ذخیره می‌شود؛ خود فایل هیچ تغییری نمی‌کند.
function pdf_kind_values() { return array('text', 'scan', 'mixed', 'broken', 'unknown'); }
function pdf_kind_label($k) {
    $m = array('text' => 'متنی', 'scan' => 'اسکن‌شده', 'mixed' => 'ترکیبی (بعضی صفحه‌ها متن، بعضی اسکن)', 'broken' => 'متن خراب (قابل خواندن نیست)', 'unknown' => 'نامشخص');
    return isset($m[$k]) ? $m[$k] : '';
}
function handle_pdf_kind(&$book) {
    if (empty($book['pdf']) || !is_array($book['pdf'])) return;
    $pick = post('pdf_kind_pick');
    $auto = array();
    $raw = post('pdf_kind_auto');
    if ($raw !== '' && strlen($raw) < 2000) {
        $j = json_decode($raw, true);
        if (is_array($j) && isset($j['kind']) && is_string($j['kind']) && in_array($j['kind'], pdf_kind_values(), true)) {
            $auto = array('kind' => $j['kind']);
            foreach (array('total', 'sampled', 'text', 'scan', 'broken', 'blank', 'unclear') as $nk) {
                $auto[$nk] = isset($j[$nk]) ? max(0, min(100000, (int)$j[$nk])) : 0;
            }
            $auto['ocr'] = !empty($j['ocr']);
        }
    }
    if ($pick !== '' && in_array($pick, pdf_kind_values(), true)) {
        $book['pdf']['kind'] = $pick;
        $book['pdf']['kindBy'] = 'manual';
        if (!empty($auto)) $book['pdf']['kindInfo'] = $auto;
    } elseif (!empty($auto)) {
        $book['pdf']['kind'] = $auto['kind'];
        $book['pdf']['kindBy'] = 'auto';
        $book['pdf']['kindInfo'] = $auto;
    } elseif (isset($book['pdf']['kindBy']) && $book['pdf']['kindBy'] === 'manual' && isset($book['pdf']['kindInfo']['kind']) && in_array($book['pdf']['kindInfo']['kind'], pdf_kind_values(), true)) {
        // ادمین گزینه‌ی «طبق تشخیص خودکار» را انتخاب کرده: به نتیجه‌ی خودکارِ ذخیره‌شده برمی‌گردیم
        $book['pdf']['kind'] = $book['pdf']['kindInfo']['kind'];
        $book['pdf']['kindBy'] = 'auto';
    }
}
function pdf_kind_panel_html($book, $bookId) {
    $kind = isset($book['pdf']['kind']) ? (string)$book['pdf']['kind'] : '';
    if (!in_array($kind, pdf_kind_values(), true)) $kind = '';
    $by = (isset($book['pdf']['kindBy']) && $book['pdf']['kindBy'] === 'manual') ? 'manual' : 'auto';
    $sel = ($by === 'manual') ? $kind : '';
    $opts = array('' => 'طبق تشخیص خودکار', 'text' => 'متنی', 'scan' => 'اسکن‌شده', 'mixed' => 'ترکیبی', 'broken' => 'متن خراب');
    $h = '<div class="pdfkind" data-book="' . htmlspecialchars((string)$bookId, ENT_QUOTES) . '" data-kind="' . htmlspecialchars($kind, ENT_QUOTES) . '" data-by="' . $by . '">'
        . '<div class="pk-t">نوع این PDF <span class="pk-badge"></span></div>'
        . '<div class="pk-bar"><i></i></div>';
    if ($kind !== '') $h .= '<div class="pk-s">ثبت‌شده: ' . pdf_kind_label($kind) . ($by === 'manual' ? ' (انتخاب دستی)' : ' (تشخیص خودکار)') . '</div>';
    else $h .= '<div class="pk-s">هنوز بررسی نشده؛ بعد از انتخاب فایل، نوعش خودکار تشخیص داده می‌شود.</div>';
    $h .= '<div class="pk-s pk-note"></div><div class="pk-row"><label>اگه نتیجه اشتباه بود، دستی تعیین کن</label><select name="pdf_kind_pick">';
    foreach ($opts as $ov => $ot) $h .= '<option value="' . $ov . '"' . ($sel === (string)$ov ? ' selected' : '') . '>' . $ot . '</option>';
    $h .= '</select></div><input type="hidden" name="pdf_kind_auto" value="">';
    if (pdf_path($book)) $h .= '<div class="pk-row"><button type="button" class="btn alt sm pk-recheck">بررسی دوباره‌ی فایل فعلی</button></div>';
    $h .= '</div>';
    if (empty($GLOBALS['PDFKIND_JS_ADDED'])) {
        $GLOBALS['PDFKIND_JS_ADDED'] = 1;
        $h .= '<script src="assets/pdfjs/pdf-kind.js?v=1"></script>';
    }
    return $h;
}
// بخش فرم: انتخاب فایل + وضعیت فعلی
function pdf_field_html($book, $bookId) {
    $lim = PDF_MAX_MB > 0 ? 'حداکثر ' . PDF_MAX_MB . ' مگابایت' : 'بدون محدودیت حجم (آپلود تکه‌تکه)';
    $h = '<label>فایل PDF کتاب <span class="hint">— ' . $lim . '</span></label>';
    $p = pdf_path($book);
    if ($p) {
        $h .= '<div class="pdfbox" style="display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin:6px 0 10px;padding:10px 12px;border:1px solid var(--b);border-radius:10px">'
            . '<span class="tag">PDF آپلود شده</span><b style="direction:ltr">' . htmlspecialchars($book['pdf']['name'] ?? 'book.pdf') . '</b>'
            . '<span class="hint">' . human_size((int)($book['pdf']['size'] ?? filesize($p))) . ' — ' . htmlspecialchars($book['pdf']['at'] ?? '') . '</span>'
            . '<a class="btn alt sm" href="admin.php?a=pdf_get&id=' . urlencode((string)$bookId) . '" target="_blank">دانلود / مشاهده</a>'
            . '<label style="font-weight:400;margin:0"><input type="checkbox" name="pdf_remove" value="1"> حذف این فایل</label></div>'
            . '<div class="hint">برای جایگزینی، فایل جدید را انتخاب کن.</div>';
    } elseif (!empty($book['pdf'])) {
        $h .= '<div class="msg err">فایل PDF این کتاب روی سرور پیدا نشد؛ دوباره بارگذاری کن.</div>';
    }
    // اگر قبلاً (در همین جلسه) فایل کامل آپلود شده بود ولی ذخیره‌ی فرم به خاطر خطای دیگری انجام نشد، همان را نگه می‌داریم
    $resume = ''; $resumeTx = '';
    $ot = isset($GLOBALS['OLD_PDF_TOKEN']) ? (string)$GLOBALS['OLD_PDF_TOKEN'] : '';
    if ($ot !== '') {
        $c = chunk_get($ot, 'pdf');
        if (is_array($c)) { $resume = $ot; $resumeTx = '✓ فایل «' . $c['name'] . '» (' . human_size($c['size']) . ') از قبل آپلود شده و آماده‌ی ذخیره است؛ فقط «ذخیره» را بزن.'; }
    }
    return $h . '<input type="file" name="book_pdf" accept="application/pdf,.pdf">'
        . '<input type="hidden" name="book_pdf_token" value="' . htmlspecialchars($resume, ENT_QUOTES) . '">'
        . '<div class="chunk-prog' . ($resume !== '' ? ' on' : '') . '" data-for="book_pdf"><div class="cp-bar"><i' . ($resume !== '' ? ' style="width:100%"' : '') . '></i></div><span class="cp-tx">' . htmlspecialchars($resumeTx, ENT_QUOTES) . '</span></div>'
        . pdf_kind_panel_html($book, $bookId);
}

function pair($faKey, $enKey, $fallbackEn = true) {
    $fa = post($faKey); $en = post($enKey);
    if ($fa === '' && $en === '') return null;
    if ($en === '' && $fallbackEn) $en = $fa;
    return array('fa' => $fa, 'en' => $en);
}

// ---------- امنیت: تنظیمات، قفل ورود، رمز دومرحله‌ای، پشتیبان ----------
// فایل‌های داخل data با پسوند php ذخیره می‌شوند و خط اولشان اجرا را متوقف می‌کند؛ پس از راه مرورگر چیزی از آن‌ها دیده نمی‌شود.
const SEC_FILE  = __DIR__ . '/data/admin-security.php';
const TRY_FILE  = __DIR__ . '/data/login-attempts.php';
const SEC_GUARD = '<' . '?php http_response_code(404); exit; ' . '?>' . "\n";
const LOCK_MAX    = 5;     // تعداد تلاش ناموفق مجاز
const LOCK_WINDOW = 900;   // ثانیه (۱۵ دقیقه): هم بازه‌ی شمارش و هم مدت قفل

function sec_read($file) {
    if (!file_exists($file)) return array();
    $raw = @file_get_contents($file);
    if ($raw === false) return array();
    if (strpos($raw, SEC_GUARD) === 0) $raw = substr($raw, strlen(SEC_GUARD));
    $d = json_decode($raw, true);
    return is_array($d) ? $d : array();
}
function sec_write($file, $data) {
    $dir = dirname($file);
    if (!is_dir($dir)) @mkdir($dir, 0755, true);
    $tmp = $file . '.tmp';
    if (@file_put_contents($tmp, SEC_GUARD . json_encode($data, JSON_UNESCAPED_UNICODE), LOCK_EX) === false) return false;
    if (!@rename($tmp, $file)) {
        if (!@copy($tmp, $file)) { @unlink($tmp); return false; }
        @unlink($tmp);
    }
    return true;
}
function admin_password_ok($pw) {
    $s = sec_read(SEC_FILE);
    if (!empty($s['pass_hash'])) return password_verify($pw, $s['pass_hash']);
    return hash_equals(ADMIN_PASSWORD, $pw);
}

function client_ip() { return isset($_SERVER['REMOTE_ADDR']) ? (string)$_SERVER['REMOTE_ADDR'] : 'unknown'; }
function lock_remaining() {
    $t = sec_read(TRY_FILE);
    $ip = client_ip();
    $until = isset($t[$ip]['until']) ? (int)$t[$ip]['until'] : 0;
    return max(0, $until - time());
}
function lock_fail() {
    $t = sec_read(TRY_FILE);
    $ip = client_ip();
    $now = time();
    foreach ($t as $k => $v) {   // پاک‌کردن رکوردهای قدیمی
        $u = isset($v['until']) ? (int)$v['until'] : 0;
        $f = (isset($v['fails']) && is_array($v['fails'])) ? $v['fails'] : array();
        $f = array_values(array_filter($f, function ($x) use ($now) { return $now - (int)$x < LOCK_WINDOW; }));
        if (!$f && $u < $now) unset($t[$k]); else $t[$k] = array('fails' => $f, 'until' => $u);
    }
    $f = (isset($t[$ip]['fails']) && is_array($t[$ip]['fails'])) ? $t[$ip]['fails'] : array();
    $until = isset($t[$ip]['until']) ? (int)$t[$ip]['until'] : 0;
    $f[] = $now;
    if (count($f) >= LOCK_MAX) { $until = $now + LOCK_WINDOW; $f = array(); }
    $t[$ip] = array('fails' => $f, 'until' => $until);
    sec_write(TRY_FILE, $t);
}
function lock_clear() {
    $t = sec_read(TRY_FILE);
    $ip = client_ip();
    if (isset($t[$ip])) { unset($t[$ip]); sec_write(TRY_FILE, $t); }
}

// رمز یک‌بارمصرف زمانی (TOTP، استاندارد RFC 6238؛ سازگار با Google Authenticator و Authy)
function b32_encode($bin) {
    $a = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    $bits = '';
    for ($i = 0; $i < strlen($bin); $i++) $bits .= str_pad(decbin(ord($bin[$i])), 8, '0', STR_PAD_LEFT);
    $out = '';
    foreach (str_split($bits, 5) as $ch) $out .= $a[bindec(str_pad($ch, 5, '0', STR_PAD_RIGHT))];
    return $out;
}
function b32_decode($str) {
    $a = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    $str = strtoupper(preg_replace('/[^A-Za-z2-7]/', '', $str));
    $bits = '';
    for ($i = 0; $i < strlen($str); $i++) $bits .= str_pad(decbin(strpos($a, $str[$i])), 5, '0', STR_PAD_LEFT);
    $out = '';
    foreach (str_split($bits, 8) as $b) if (strlen($b) === 8) $out .= chr(bindec($b));
    return $out;
}
function totp_code($secret, $counter) {
    $key = b32_decode($secret);
    $bin = pack('N', 0) . pack('N', $counter);
    $h = hash_hmac('sha1', $bin, $key, true);
    $o = ord($h[19]) & 15;
    $v = ((ord($h[$o]) & 0x7f) << 24) | (ord($h[$o + 1]) << 16) | (ord($h[$o + 2]) << 8) | ord($h[$o + 3]);
    return str_pad((string)($v % 1000000), 6, '0', STR_PAD_LEFT);
}
function totp_verify($secret, $code) {
    $code = preg_replace('/\D/', '', fa_digits_to_en((string)$code));
    if (strlen($code) !== 6) return false;
    $c = (int)floor(time() / 30);
    for ($i = -1; $i <= 1; $i++) if (hash_equals(totp_code($secret, $c + $i), $code)) return true;
    return false;
}
function totp_new_secret() { return b32_encode(random_bytes(10)); }

// پشتیبان‌ها
function backup_kinds() { return array('authors' => 'نویسنده‌ها', 'books' => 'کتاب‌ها', 'genres' => 'ژانرها'); }
function backup_path($name) {
    if (!preg_match('/^(authors|books|genres)-\d{8}-\d{6}\.json$/', $name)) return null;
    $p = BACKUP_DIR . '/' . $name;
    return is_file($p) ? $p : null;
}
function backup_list() {
    $out = array();
    $files = glob(BACKUP_DIR . '/*.json');
    if (!$files) return $out;
    foreach ($files as $f) {
        $b = basename($f);
        if (!preg_match('/^(authors|books|genres)-(\d{4})(\d{2})(\d{2})-(\d{2})(\d{2})(\d{2})\.json$/', $b, $m)) continue;
        $ts = strtotime($m[2] . '-' . $m[3] . '-' . $m[4] . ' ' . $m[5] . ':' . $m[6] . ':' . $m[7]);
        if (!$ts) $ts = (int)@filemtime($f);
        $out[] = array('file' => $b, 'kind' => $m[1], 'ts' => $ts, 'size' => (int)@filesize($f));
    }
    usort($out, function ($a, $b) { return $b['ts'] - $a['ts']; });
    return $out;
}

// ---------- ورود / خروج ----------
$loggedIn = !empty($_SESSION['admin_ok']);
$action = isset($_GET['a']) ? $_GET['a'] : 'home';
$GLOBALS['OLD_PDF_TOKEN'] = (isset($_SESSION['old']) && is_array($_SESSION['old']) && isset($_SESSION['old']['book_pdf_token']) && is_string($_SESSION['old']['book_pdf_token'])) ? $_SESSION['old']['book_pdf_token'] : '';

// دریافت یک تکه از فایل بزرگ (PDF کتاب یا عکس اصلی). پاسخ JSON است.
if ($loggedIn && $action === 'chunk' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    // تکه از post_max_size بزرگ‌تر بوده: PHP کل درخواست را خالی می‌کند؛ مرورگر تکه‌ی کوچک‌تر می‌فرستد
    if (empty($_POST) && empty($_FILES)) chunk_json(array('ok' => false, 'err' => 'toolarge', 'msg' => 'تکه از حد سرور بزرگ‌تر بود.'));
    if (!csrf_ok()) chunk_json(array('ok' => false, 'err' => 'csrf', 'msg' => 'نشست منقضی شده؛ صفحه را دوباره باز کن.'));
    $kind  = post('kind');
    $token = post('token');
    $off   = preg_match('/^\d{1,12}$/', post('offset')) ? (int)post('offset') : -1;
    $total = preg_match('/^\d{1,12}$/', post('total')) ? (int)post('total') : 0;
    $tp = chunk_part_path($token);
    if (($kind !== 'pdf' && $kind !== 'photo') || !$tp || $off < 0 || $total < 1) chunk_json(array('ok' => false, 'err' => 'bad', 'msg' => 'درخواست آپلود نامعتبر است.'));
    if ($kind === 'pdf' && PDF_MAX_MB > 0 && $total > PDF_MAX_MB * 1048576) chunk_json(array('ok' => false, 'err' => 'big', 'msg' => 'حجم PDF بیشتر از ' . PDF_MAX_MB . ' مگابایت است.'));
    if ($kind === 'photo' && $total > PHOTO_MAX_MB * 1048576) chunk_json(array('ok' => false, 'err' => 'big', 'msg' => 'حجم عکس بیشتر از ' . PHOTO_MAX_MB . ' مگابایت است.'));
    if (empty($_FILES['chunk']) || $_FILES['chunk']['error'] !== UPLOAD_ERR_OK) {
        $ec = empty($_FILES['chunk']) ? -1 : $_FILES['chunk']['error'];
        chunk_json(array('ok' => false, 'err' => ($ec === UPLOAD_ERR_INI_SIZE || $ec === UPLOAD_ERR_FORM_SIZE) ? 'toolarge' : 'upload', 'msg' => 'دریافت تکه ناموفق بود (کد ' . $ec . ').'));
    }
    if (!chunk_dir_ready()) chunk_json(array('ok' => false, 'err' => 'dir', 'msg' => 'ساخت پوشه‌ی data/chunks ممکن نشد؛ دسترسی نوشتن پوشه‌ی data را بررسی کن.'));
    if ($off === 0 && !isset($_SESSION['chunks'][$token])) {
        chunk_cleanup_stale();
        $nm = preg_replace('/[\x00-\x1f"\\\\\/]/', '', (string)post('name'));
        $_SESSION['chunks'][$token] = array('kind' => $kind, 'size' => $total, 'name' => ($nm !== '' ? (function_exists('mb_substr') ? mb_substr($nm, 0, 200) : substr($nm, 0, 200)) : 'file'), 'at' => time());
        // سشن‌های رهاشده: فقط ۲۰ رکورد آخر نگه داشته می‌شود
        if (count($_SESSION['chunks']) > 20) {
            $stale = array_slice($_SESSION['chunks'], 0, count($_SESSION['chunks']) - 20, true);
            foreach ($stale as $ot => $unused) chunk_forget($ot, true);
        }
        $free = @disk_free_space(CHUNK_DIR);
        if ($free !== false && $free < $total + 20 * 1048576) { chunk_forget($token, true); chunk_json(array('ok' => false, 'err' => 'disk', 'msg' => 'فضای خالی دیسک هاست کافی نیست.')); }
    }
    $rec = isset($_SESSION['chunks'][$token]) ? $_SESSION['chunks'][$token] : null;
    if (!$rec || $rec['kind'] !== $kind || (int)$rec['size'] !== $total) chunk_json(array('ok' => false, 'err' => 'bad', 'msg' => 'این آپلود دیگر معتبر نیست؛ فایل را دوباره انتخاب کن.'));
    clearstatcache(true, $tp);
    $have = is_file($tp) ? (int)filesize($tp) : 0;
    if ($off !== $have) chunk_json(array('ok' => false, 'err' => 'offset', 'have' => $have, 'msg' => 'جای تکه با فایل روی سرور نمی‌خواند.'));
    $data = @file_get_contents($_FILES['chunk']['tmp_name']);
    if ($data === false || $data === '') chunk_json(array('ok' => false, 'err' => 'upload', 'msg' => 'خواندن تکه ممکن نشد.'));
    if ($have + strlen($data) > $total) { chunk_forget($token, true); chunk_json(array('ok' => false, 'err' => 'bad', 'msg' => 'حجم دریافتی از حجم اعلام‌شده بیشتر شد؛ دوباره تلاش کن.')); }
    $fh = @fopen($tp, 'ab');
    if (!$fh || !flock($fh, LOCK_EX) || fwrite($fh, $data) !== strlen($data)) {
        if ($fh) fclose($fh);
        chunk_json(array('ok' => false, 'err' => 'write', 'msg' => 'نوشتن روی دیسک ممکن نشد (دسترسی یا فضای خالی).'));
    }
    fflush($fh); flock($fh, LOCK_UN); fclose($fh);
    $have += strlen($data);
    $done = ($have === $total);
    if ($done) {
        // بررسی سریع نوع فایل بلافاصله بعد از کامل شدن
        if ($kind === 'pdf') {
            $hf = @fopen($tp, 'rb'); $hd = $hf ? fread($hf, 1024) : ''; if ($hf) fclose($hf);
            if (pdf_check_header($hd) !== '') { chunk_forget($token, true); chunk_json(array('ok' => false, 'err' => 'type', 'msg' => 'این فایل PDF نیست.')); }
        } else {
            $gi = @getimagesize($tp);
            if (!$gi || !in_array($gi[2], array(IMAGETYPE_JPEG, IMAGETYPE_PNG, IMAGETYPE_WEBP), true)) { chunk_forget($token, true); chunk_json(array('ok' => false, 'err' => 'type', 'msg' => 'فرمت عکس باید JPG، PNG یا WEBP باشد.')); }
        }
    }
    chunk_json(array('ok' => true, 'have' => $have, 'done' => $done));
}

// دانلود PDF کتاب (فقط ادمین واردشده)
if ($loggedIn && $action === 'pdf_get') {
    $bk = null; foreach (read_books() as $b0) if ((string)($b0['id'] ?? '') === (string)(isset($_GET['id']) ? $_GET['id'] : '')) { $bk = $b0; break; }
    $pp = $bk ? pdf_path($bk) : null;
    if (!$pp) { http_response_code(404); die('PDF not found'); }
    header('Content-Type: application/pdf');
    header('Content-Length: ' . filesize($pp));
    header('Content-Disposition: inline; filename="book-' . preg_replace('/\D/', '', (string)$bk['id']) . '.pdf"');
    header('X-Content-Type-Options: nosniff');
    readfile($pp); exit;
}
// اگر حجم فرم از post_max_size بیشتر باشد PHP کل فرم را خالی می‌کند
if ($loggedIn && $_SERVER['REQUEST_METHOD'] === 'POST' && empty($_POST) && empty($_FILES) && !empty($_SERVER['CONTENT_LENGTH'])) {
    flash('err', 'حجم فایل از حد مجاز سرور بیشتر بود و چیزی ذخیره نشد (post_max_size = ' . ini_get('post_max_size') . '، upload_max_filesize = ' . ini_get('upload_max_filesize') . '). مقدارها را در php.ini بالا ببر و Apache را ریستارت کن.');
    redirect('admin.php?a=books');
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'login') {
    $wait = lock_remaining();
    if ($wait > 0) {
        flash('err', 'تلاش‌های ناموفق زیاد بود. حدود ' . (int)ceil($wait / 60) . ' دقیقه‌ی دیگر دوباره امتحان کن.');
        redirect('admin.php');
    }
    $secL = sec_read(SEC_FILE);
    $okPass = admin_password_ok(post('password'));
    $okCode = true;
    if (!empty($secL['totp_on']) && !empty($secL['totp_secret'])) $okCode = totp_verify($secL['totp_secret'], post('code'));
    if ($okPass && $okCode) {
        session_regenerate_id(true);
        $_SESSION['admin_ok'] = true;
        lock_clear();
        redirect('admin.php');
    }
    lock_fail();
    usleep(500000);
    flash('err', 'رمز یا کد تأیید اشتباه است.');
    redirect('admin.php');
}
if ($action === 'logout') { session_destroy(); redirect('admin.php'); }

// ---------- عملیات (فقط بعد از ورود) ----------
if ($loggedIn && $_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!csrf_ok()) { flash('err', 'نشست منقضی شده؛ دوباره تلاش کن.'); redirect('admin.php'); }
    $lockResult = content_write_lock();
    if ($lockResult !== true) { flash('err', $lockResult); redirect('admin.php'); }
    // Refresh genres after acquiring the lock, not before a concurrent save.
    $GENRE_GROUPS = array();
    foreach (all_genre_groups() as $gk => $gv) $GENRE_GROUPS[$gk] = $gv['fa'];
    $list = in_array($action, array('delete', 'save'), true) ? read_authors() : array();

    if ($action === 'delete') {
        $id = post('id');
        $new = array(); $removed = null;
        foreach ($list as $a) { if (($a['id'] ?? '') === $id) $removed = $a; else $new[] = $a; }
        if (!$removed) { flash('err', 'نویسنده پیدا نشد.'); redirect('admin.php?a=list'); }
        // نویسنده و کتاب‌های تک‌کتابی‌اش در یک عملیات گروهی ذخیره می‌شوند؛ اگر هر کدام شکست بخورد، هر دو به حالت قبل برمی‌گردند.
        $writes = array(AUTHORS_FILE => array('kind' => 'authors', 'data' => array_values($new)));
        $delBooks = array();
        if (!empty($removed['singleBook'])) {
            $keep = array();
            foreach (read_books() as $bk0) { if (($bk0['authorId'] ?? '') !== $id) $keep[] = $bk0; else $delBooks[] = $bk0; }
            $writes[BOOKS_FILE] = array('kind' => 'books', 'data' => array_values($keep));
        }
        $r = save_content_batch($writes);
        if ($r !== true) flash('err', $r . ' — هیچ نویسنده، کتاب یا PDF‌ای حذف نشد.');
        else {
            // فایل‌های PDF فقط بعد از ذخیره‌ی موفق همه‌ی داده‌ها پاک می‌شوند
            foreach ($delBooks as $bk0) pdf_delete_file($bk0);
            featured_sync($id, false);   // از کادر چهره‌ها هم برداشته شود
            $extra = ' (نسخه‌ی پشتیبان در data/backups ذخیره شد؛ عکس و کتاب‌هایش دست نخورده ماندند.)';
            if (!empty($removed['singleBook'])) $extra = ' (کتابِ تک‌کتابی او هم حذف شد؛ نسخه‌ی پشتیبان در data/backups هست.)';
            flash('ok', 'نویسنده «' . ($removed['name']['fa'] ?? '') . '» حذف شد.' . $extra);
        }
        redirect('admin.php?a=list');
    }

    if ($action === 'save') {
        $editId = post('edit_id');           // خالی یعنی نویسنده‌ی جدید
        $errors = array();

        $slug = slug_normalize(post('slug'));
        $nameFa = post('name_fa'); $nameEn = post('name_en');
        $birth = fa_digits_to_en(post('birthYear')); $death = fa_digits_to_en(post('deathYear'));
        $group = post('genreGroup');
        $bioFa = post('bio_fa');

        // ----- single-book author: book and its genre are saved here -----
        $single = (post('single') === '1');
        $bookGroupKey = ''; $newGenre = null; $bPrice = ''; $bPages = '';
        if ($single) {
            $choice = post('b_genre_choice');
            if ($choice === '__new') {
                $gfa = post('b_newgenre_fa'); $gen = post('b_newgenre_en');
                if ($gfa === '') {
                    $errors[] = 'نام ژانر جدید را بنویس.';
                } else {
                    foreach ($GENRE_GROUPS as $gk => $lbl) if ($lbl === $gfa) $bookGroupKey = $gk; // already exists
                    if ($bookGroupKey === '') {
                        $gkey = trim(strtolower(preg_replace('/[^a-z0-9]+/i', '_', $gen)), '_');
                        if ($gkey === '') $gkey = 'g_' . substr(md5($gfa), 0, 8);
                        if (isset($GENRE_GROUPS[$gkey])) $gkey .= '_' . substr(md5($gfa), 0, 4);
                        $bookGroupKey = $gkey;
                        $newGenre = array('fa' => $gfa, 'en' => $gen);
                    }
                }
            } elseif (isset($GENRE_GROUPS[$choice])) {
                $bookGroupKey = $choice;
            } else {
                $errors[] = 'ژانر کتاب را انتخاب کن یا «ژانر جدید» را بزن و بنویس.';
            }
            $group = $bookGroupKey;
            $bPrice = fa_digits_to_en(post('b_price')); $bPages = fa_digits_to_en(post('b_pages'));
            if (post('b_title_fa') === '') $errors[] = 'نام فارسی کتاب لازم است.';
            if (!preg_match('/^\d{1,9}$/', $bPrice)) $errors[] = 'قیمت کتاب (تومان) باید عدد باشد.';
            if (!preg_match('/^[1-9]\d{0,4}$/', $bPages)) $errors[] = 'تعداد صفحه باید یک عدد بزرگ‌تر از صفر باشد.';
        }

        $idx = null;
        foreach ($list as $i => $a) if (($a['id'] ?? '') === $editId) $idx = $i;
        if ($editId !== '' && $idx === null) $errors[] = 'نویسنده‌ای که می‌خواهی ویرایش کنی پیدا نشد.';

        if ($editId === '') {
            // اگه slug خالی بود، خودکار از اسم انگلیسی (یا اگه نبود از اسم فارسی) ساخته می‌شه؛ اگه تکراری بود -2 و -3 ... اضافه می‌شه
            if ($slug === '') {
                $slug = slug_normalize(str_replace(array("'", "’", "‘"), '', $nameEn));
                if ($slug === '') $slug = persian_to_slug($nameFa);
                if (strlen($slug) > 60) $slug = trim(substr($slug, 0, 60), '-');
                $base0 = $slug; $n0 = 2;
                while ($slug !== '') {
                    $dup = false; foreach ($list as $a) if (($a['slug'] ?? '') === $slug) { $dup = true; break; }
                    if (!$dup) break;
                    $slug = $base0 . '-' . $n0++;
                }
            }
            if (!preg_match('/^[a-z0-9]+(-[a-z0-9]+)*$/', $slug)) $errors[] = 'آدرس (slug) ساخته نشد؛ نام انگلیسی نویسنده را بنویس یا آدرس را دستی وارد کن (حروف انگلیسی کوچک، عدد و خط تیره). مثال: orwell';
            foreach ($list as $a) if (($a['slug'] ?? '') === $slug) $errors[] = 'این آدرس (slug) قبلاً استفاده شده است.';
        } elseif ($idx !== null) {
            $slug = $list[$idx]['slug'] ?? '';
            if ($slug === '') {
                // نویسنده‌ی قدیمی بدون slug: اجازه‌ی تعیین slug
                $slug = slug_normalize(post('slug'));
                if ($slug !== '' && !preg_match('/^[a-z0-9]+(-[a-z0-9]+)*$/', $slug)) $errors[] = 'آدرس (slug) نامعتبر است.';
                foreach ($list as $a) if ($slug !== '' && ($a['slug'] ?? '') === $slug) $errors[] = 'این آدرس (slug) قبلاً استفاده شده است.';
            }
        }
        // فیلدهای فارسی: همه لازم‌اند و باید حروف فارسی داشته باشند (نه خالی، نه فقط انگلیسی)
        $faReq = array('name_fa' => 'نام فارسی', 'nat_fa' => 'ملیت (فارسی)', 'bio_fa' => 'بیوگرافی (فارسی)');
        if (!$single) $faReq['genre_fa'] = 'سبک و ژانر (فارسی)';
        foreach ($faReq as $k => $lbl) {
            $val = post($k);
            if ($val === '') $errors[] = '«' . $lbl . '» لازم است (برای نسخه‌ی فارسی سایت و گوگل).';
            elseif (!has_arabic_script($val)) $errors[] = '«' . $lbl . '» باید فارسی باشد (حروف فارسی ندارد).';
        }
        if ($single && post('b_genre_choice') === '__new' && post('b_newgenre_fa') !== '' && !has_arabic_script(post('b_newgenre_fa'))) $errors[] = '«نام ژانر جدید (فارسی)» باید فارسی باشد.';
        if (post('meta_fa') !== '' && !has_arabic_script(post('meta_fa'))) $errors[] = '«توضیح متا (فارسی)» باید فارسی باشد.';
        // فیلدهای انگلیسی: همه لازم‌اند و باید فقط انگلیسی باشند (برای نسخه‌ی انگلیسی سایت و گوگل)
        $enReq = array('name_en' => 'نام انگلیسی', 'nat_en' => 'ملیت (انگلیسی)', 'bio_en' => 'بیوگرافی (انگلیسی)');
        if (!$single) $enReq['genre_en'] = 'سبک و ژانر (انگلیسی)';
        foreach ($enReq as $k => $lbl) {
            $val = post($k);
            if ($val === '') $errors[] = '«' . $lbl . '» لازم است (برای نسخه‌ی انگلیسی سایت و گوگل).';
            elseif (has_arabic_script($val)) $errors[] = '«' . $lbl . '» باید فقط انگلیسی باشد (حروف فارسی دارد).';
        }
        if ($single && post('b_genre_choice') === '__new') {
            if (post('b_newgenre_en') === '') $errors[] = '«نام ژانر جدید (انگلیسی)» لازم است.';
            elseif (has_arabic_script(post('b_newgenre_en'))) $errors[] = '«نام ژانر جدید (انگلیسی)» باید فقط انگلیسی باشد.';
        }
        if (post('meta_en') !== '' && has_arabic_script(post('meta_en'))) $errors[] = '«توضیح متا (انگلیسی)» باید فقط انگلیسی باشد.';
        if (!preg_match('/^-?\d{1,4}$/', $birth)) $errors[] = 'سال تولد باید عدد باشد.';
        if ($death !== '' && !preg_match('/^-?\d{1,4}$/', $death)) $errors[] = 'سال وفات باید عدد باشد (یا خالی اگر زنده است).';
        if (!$single && !isset($GLOBALS['GENRE_GROUPS'][$group])) $errors[] = 'گروه ژانر را انتخاب کن.';

        // «تک‌کتابی» فقط برای نویسنده‌ای مجاز است که بیش از یک کتاب ندارد؛ هیچ کتابی خودکار حذف یا بازنویسی نمی‌شود.
        if ($single && $editId !== '') {
            $bookCount = 0;
            foreach (read_books() as $bk1) if (($bk1['authorId'] ?? '') === $editId) $bookCount++;
            if ($bookCount > 1) $errors[] = 'این نویسنده ' . $bookCount . ' کتاب دارد و نمی‌شود او را «تک‌کتابی» کرد. اول کتاب‌های اضافه را از بخش کتاب‌ها حذف کن یا به نویسنده‌ی دیگری منتقل کن تا فقط یک کتاب بماند، بعد دوباره امتحان کن. (چیزی تغییر نکرد.)';
        }

        $author = ($idx !== null) ? $list[$idx] : array();
        if (!$errors) {
            $photo = handle_photo_upload($slug);
            if ($photo !== '' && $photo[0] === '!') { $errors[] = substr($photo, 1); $photo = ''; }
        }

        if ($errors) {
            $_SESSION['old'] = $_POST;
            flash('err', implode("\n", $errors));
            redirect('admin.php?a=' . ($editId === '' ? 'new' : 'edit&id=' . urlencode($editId)));
        }

        // ساخت رکورد (فیلدهای ناشناخته‌ی قبلی مثل readingOrder حفظ می‌شوند)
        if ($newGenre) $GENRE_GROUPS[$group] = $newGenre['fa'];
        $author['id'] = $editId !== '' ? $editId : next_author_id($list);
        if ($slug !== '') $author['slug'] = $slug;
        $author['name'] = array('fa' => $nameFa, 'en' => $nameEn);
        $author['avatarEmoji'] = post('emoji') !== '' ? post('emoji') : '📖';
        $author['birthYear'] = (int)$birth;
        $author['deathYear'] = $death === '' ? null : (int)$death;
        $author['nationality'] = pair('nat_fa', 'nat_en') ?: array('fa' => '', 'en' => '');
        $genre = $single ? null : pair('genre_fa', 'genre_en'); // تک‌کتابی: ژانر نویسنده = ژانر کتاب
        $groupEn = $newGenre ? $newGenre['en'] : (isset(all_genre_groups()[$group]['en']) ? all_genre_groups()[$group]['en'] : $GENRE_GROUPS[$group]);
        $author['genre'] = $genre ?: array('fa' => $GENRE_GROUPS[$group], 'en' => $groupEn);
        $author['genreGroup'] = $group;
        foreach (array('awards' => array('awards_fa', 'awards_en'), 'quote' => array('quote_fa', 'quote_en')) as $k => $ks) {
            $p = pair($ks[0], $ks[1]);
            if ($p) $author[$k] = $p; else unset($author[$k]);
        }
        $author['bio'] = pair('bio_fa', 'bio_en');
        $md = pair('meta_fa', 'meta_en', false);   // توضیح متای گوگل: فارسی و انگلیسی (هرکدام خالی باشد، خودکار ساخته می‌شود)
        if ($md) $author['metaDescription'] = array('fa' => $md['fa'], 'en' => $md['en']); else unset($author['metaDescription']);
        if ($photo !== '') $author['photo'] = $photo;
        if ($single) $author['singleBook'] = true; else unset($author['singleBook']);

        $backTo = 'admin.php?a=' . ($editId === '' ? 'new' : 'edit&id=' . urlencode($editId));
        $booksToSave = null;
        if ($single) {
            $allG = all_genre_groups();
            $gl = $newGenre ? $newGenre : $allG[$group];
            $books = read_books();
            $bi = null;
            foreach ($books as $i2 => $b2) if (($b2['authorId'] ?? '') === $author['id']) { $bi = $i2; break; }
            $book = ($bi !== null) ? $books[$bi] : array();
            $bt = pair('b_title_fa', 'b_title_en');
            $bd = pair('b_desc_fa', 'b_desc_en');
            $book['id'] = isset($book['id']) ? $book['id'] : next_book_id($books);
            $book['title'] = $bt;
            $book['author'] = $author['name'];
            $book['authorId'] = $author['id'];
            $book['genre'] = array('fa' => $gl['fa'], 'en' => $gl['en']);
            $book['genreGroup'] = $group;
            $book['category'] = post('b_category') !== '' ? post('b_category') : 'fiction';
            $pb = pair('b_publisher_fa', 'b_publisher_en');
            $book['publisher'] = $pb ? $pb : array('fa' => '', 'en' => '');
            $tr = pair('b_translator_fa', 'b_translator_en');
            $book['translator'] = $tr ? $tr : array('fa' => '', 'en' => '');
            $book['pages'] = (int)$bPages;
            $book['totalPrice'] = (int)$bPrice;
            if (!isset($book['isFamous'])) $book['isFamous'] = false;
            foreach (array('salesSite', 'salesIran', 'salesWorld') as $sk) if (!isset($book[$sk])) $book[$sk] = 0;
            $book['desc'] = $bd ? $bd : array('fa' => '', 'en' => '');
            if (empty($book['bio']['fa']) && empty($book['bio']['en'])) $book['bio'] = $book['desc'];   // بیوگرافی بلندِ موجود بازنویسی نمی‌شود
            handle_pdf_remove($book);
            $pdfRes = handle_pdf_upload('book_pdf', $book);
            if ($pdfRes !== '' && $pdfRes[0] === '!') { $_SESSION['old'] = $_POST; flash('err', substr($pdfRes, 1)); redirect($backTo); }
            handle_pdf_kind($book);
            if ($bi !== null) $books[$bi] = $book; else $books[] = $book;
            $booksToSave = $books;
        }

        if ($idx !== null) $list[$idx] = $author; else $list[] = $author;
        // نام کتاب‌ها هم پیش از ذخیره آماده می‌شود؛ همه‌ی فایل‌ها در یک گروه ذخیره می‌شوند.
        $renameNote = '';
        $allBooks = $booksToSave !== null ? $booksToSave : read_books(); $renamed = 0;
        foreach ($allBooks as $rk => $rb) {
            if (($rb['authorId'] ?? '') === $author['id'] && ($rb['author'] ?? null) !== $author['name']) { $allBooks[$rk]['author'] = $author['name']; $renamed++; }
        }
        $writes = array(AUTHORS_FILE => array('kind' => 'authors', 'data' => array_values($list)));
        if ($booksToSave !== null || $renamed > 0) $writes[BOOKS_FILE] = array('kind' => 'books', 'data' => array_values($allBooks));
        if ($newGenre) {
            $genres = custom_genre_groups(); $genres[$group] = $newGenre;
            $writes[GENRES_FILE] = array('kind' => 'genres', 'data' => $genres);
        }
        $r = save_content_batch($writes);
        if ($r !== true) { $_SESSION['old'] = $_POST; flash('err', $r); redirect($backTo); }
        pdf_finish_changes(true);
        if ($renamed > 0) $renameNote = ' اسم نویسنده روی ' . $renamed . ' کتاب هم به‌روز شد. ';
        // کادر چهره‌ها: بر اساس چک‌باکس فرم، نویسنده اضافه یا برداشته می‌شود
        $facesNote = '';
        if (post('faces_present') === '1') {
            $wantFaces = (post('in_faces') === '1');
            $fr = featured_sync($author['id'], $wantFaces);
            if ($fr !== true) $facesNote = ' (هشدار: کادر چهره‌ها به‌روز نشد: ' . $fr . ') ';
            elseif ($wantFaces) $facesNote = (author_photo_rel($author) === '' ? ' در کادر چهره‌ها ثبت شد، اما چون عکس ندارد فعلاً ایموجی نمایش داده می‌شود. ' : ' در کادر چهره‌ها هم نمایش داده می‌شود. ');
        }
        unset($_SESSION['old']);
        flash('ok', 'ذخیره شد. ' . $facesNote . $renameNote . ($single ? 'کتاب و ژانر هم ثبت شد. ' : '') . (!empty($author['slug']) ? 'صفحه‌ی نویسنده: author-' . $author['slug'] . '.html — نسخه‌ی انگلیسی: en-author-' . $author['slug'] . '.html' : ''));
        redirect('admin.php?a=list');
    }
    // ----- بازگردانی نسخه‌ی پشتیبان -----
    if ($action === 'restore') {
        $p = backup_path(post('file'));
        if (!$p) { flash('err', 'نسخه‌ی پشتیبان پیدا نشد.'); redirect('admin.php?a=security'); }
        $raw = (string)@file_get_contents($p);
        if (substr($raw, 0, 3) === "\xEF\xBB\xBF") $raw = substr($raw, 3);
        $data = json_decode($raw, true);
        if (!is_array($data)) { flash('err', 'این فایل پشتیبان خراب است و بازگردانی نشد.'); redirect('admin.php?a=security'); }
        $pre = explode('-', basename($p));
        $kind = $pre[0];
        $GLOBALS['HIST_OP'] = 'restore';   // در لاگ به‌عنوان «بازگردانی» ثبت شود
        if ($kind === 'authors') $r = save_authors($data);
        elseif ($kind === 'books') $r = save_books($data);
        else $r = save_json_file(GENRES_FILE, 'genres', $data);
        unset($GLOBALS['HIST_OP']);
        if ($r === true) flash('ok', 'نسخه‌ی پشتیبان بازگردانی شد. از فایل قبلی هم پشتیبان گرفته شد؛ اگر پشیمان شدی، از همین لیست برش گردان.');
        else flash('err', $r);
        redirect('admin.php?a=security');
    }

    // ----- تغییر رمز -----
    if ($action === 'pass_change') {
        $n1 = post('new1');
        if (!admin_password_ok(post('cur'))) { flash('err', 'رمز فعلی درست نیست.'); redirect('admin.php?a=security'); }
        if (strlen($n1) < 8) { flash('err', 'رمز جدید باید حداقل ۸ کاراکتر باشد.'); redirect('admin.php?a=security'); }
        if ($n1 !== post('new2')) { flash('err', 'تکرار رمز با رمز جدید یکی نیست.'); redirect('admin.php?a=security'); }
        $sec = sec_read(SEC_FILE);
        $sec['pass_hash'] = password_hash($n1, PASSWORD_DEFAULT);
        if (!sec_write(SEC_FILE, $sec)) { flash('err', 'ذخیره ممکن نشد. دسترسی نوشتن پوشه‌ی data را بررسی کن.'); redirect('admin.php?a=security'); }
        session_regenerate_id(true);
        hist_event('pass_change', 'رمز ورود عوض شد');
        flash('ok', 'رمز عوض شد. از این به بعد با رمز جدید وارد شو (رمز داخل admin-config.php دیگر استفاده نمی‌شود).');
        redirect('admin.php?a=security');
    }

    // ----- رمز دومرحله‌ای -----
    if ($action === 'totp_start') {
        $_SESSION['totp_pending'] = totp_new_secret();
        redirect('admin.php?a=security');
    }
    if ($action === 'totp_cancel') {
        unset($_SESSION['totp_pending']);
        redirect('admin.php?a=security');
    }
    if ($action === 'totp_enable') {
        $sp = isset($_SESSION['totp_pending']) ? (string)$_SESSION['totp_pending'] : '';
        if ($sp === '') { flash('err', 'اول «شروع فعال‌سازی» را بزن.'); redirect('admin.php?a=security'); }
        if (!totp_verify($sp, post('code'))) { flash('err', 'کد درست نبود. مطمئن شو ساعت گوشی و سرور درست است و دوباره امتحان کن.'); redirect('admin.php?a=security'); }
        $sec = sec_read(SEC_FILE);
        $sec['totp_secret'] = $sp;
        $sec['totp_on'] = true;
        if (!sec_write(SEC_FILE, $sec)) { flash('err', 'ذخیره ممکن نشد. دسترسی نوشتن پوشه‌ی data را بررسی کن.'); redirect('admin.php?a=security'); }
        unset($_SESSION['totp_pending']);
        hist_event('totp_on', 'تأیید دومرحله‌ای فعال شد');
        flash('ok', 'تأیید دومرحله‌ای فعال شد. از ورود بعدی، علاوه بر رمز، کد ۶ رقمی هم لازم است.');
        redirect('admin.php?a=security');
    }
    if ($action === 'totp_disable') {
        $sec = sec_read(SEC_FILE);
        if (!admin_password_ok(post('cur'))) { flash('err', 'رمز فعلی درست نیست.'); redirect('admin.php?a=security'); }
        if (!empty($sec['totp_secret']) && !totp_verify($sec['totp_secret'], post('code'))) { flash('err', 'کد تأیید درست نیست.'); redirect('admin.php?a=security'); }
        unset($sec['totp_secret']);
        $sec['totp_on'] = false;
        if (!sec_write(SEC_FILE, $sec)) { flash('err', 'ذخیره ممکن نشد.'); redirect('admin.php?a=security'); }
        hist_event('totp_off', 'تأیید دومرحله‌ای غیرفعال شد');
        flash('ok', 'تأیید دومرحله‌ای غیرفعال شد.');
        redirect('admin.php?a=security');
    }

    featured_handle_post($action);
    content_handle_post($action);

    redirect('admin.php?a=list');
}

// ---------- نمایش ----------
$flash = isset($_SESSION['flash']) ? $_SESSION['flash'] : null;
unset($_SESSION['flash']);

// Admin-only theme (independent of the public site): keys in localStorage start with adm_
function admin_theme_boot_js() {
    return <<<'JS'
window.admApplyTheme=function(hex){
  var r=document.documentElement,n=parseInt(hex.substring(1),16),R=(n>>16)&255,G=(n>>8)&255,B=n&255;
  var dark=(0.2126*R+0.7152*G+0.0722*B)<128,st=r.style;
  st.setProperty('--bg',hex);var tm=document.getElementById('admThemeMeta');if(tm)tm.setAttribute('content',hex);
  if(dark){
    st.setProperty('--card','rgba(255,255,255,0.07)');st.setProperty('--inp','rgba(255,255,255,0.10)');
    st.setProperty('--t','#f5f6fa');st.setProperty('--m','#cbd5e1');st.setProperty('--b','rgba(255,255,255,0.18)');
    st.setProperty('--p','#e84118');r.classList.add('adm-dark');
  }else{
    st.setProperty('--card','#ffffff');st.setProperty('--inp','#ffffff');
    st.setProperty('--t','#2b2b2b');st.setProperty('--m','#777');st.setProperty('--b','rgba(0,0,0,0.14)');
    st.setProperty('--p','#c0504d');r.classList.remove('adm-dark');
  }
};
window.admResetTheme=function(){
  var r=document.documentElement;r.classList.remove('adm-dark');
  ['--bg','--card','--inp','--t','--m','--b','--p'].forEach(function(k){r.style.removeProperty(k);});var tm=document.getElementById('admThemeMeta');if(tm)tm.setAttribute('content','#eef0f4');
};
try{var c=localStorage.getItem('adm_theme_color');if(c&&/^#[0-9a-f]{6}$/i.test(c))window.admApplyTheme(c);}catch(e){}
JS;
}

function icon($n) {
    $p = array(
        'home'   => '<path d="M4 11.5 12 4l8 7.5"/><path d="M6 10v9a1 1 0 0 0 1 1h3.5v-5h3v5H17a1 1 0 0 0 1-1v-9"/>',
        'shield' => '<path d="M12 3 4.5 6v5.5c0 4.3 3.1 8 7.5 9.5 4.4-1.5 7.5-5.2 7.5-9.5V6z"/><path d="m9 12 2.2 2.2L15.5 10"/>',
        'book'   => '<path d="M4 19.5V5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2z"/><path d="M8 7h6"/>',
        'users'  => '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.5 3.2-5.5 6.5-5.5s5.9 2 6.5 5.5"/><path d="M16 4.7a3.5 3.5 0 0 1 0 6.6"/><path d="M18 14.8c2 .7 3.2 2.4 3.5 5.2"/>',
        'site'   => '<path d="M14 4h6v6"/><path d="M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
        'theme'  => '<path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.6-.8 1.6-1.6 0-.5-.3-.9-.5-1.3-.3-.4-.5-.8-.5-1.3 0-.9.7-1.6 1.6-1.6H16a5 5 0 0 0 5-5C21 6.4 17 3 12 3z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7.5" r="1"/><circle cx="14.5" cy="7.5" r="1"/>',
        'logout' => '<path d="M9 20H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h4"/><path d="M16 16l4-4-4-4"/><path d="M20 12H9"/>',
        'plus'   => '<path d="M12 5v14M5 12h14"/>',
        'more'   => '<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>',
        'link'   => '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3A4 4 0 0 0 11 18.7l1-1"/>',
    );
    return '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">' . ($p[$n] ?? '') . '</svg>';
}

function layout_start($title) {
    echo '<!DOCTYPE html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><script>(function(){["copy","cut","paste","contextmenu","selectstart"].forEach(function(t){window.addEventListener(t,function(e){e.stopImmediatePropagation();},true);});})();</script>'
       . '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">'
       . '<meta name="theme-color" id="admThemeMeta" content="#eef0f4">'
       . '<meta name="robots" content="noindex,nofollow"><title>' . e($title) . '</title><script>' . admin_theme_boot_js() . '</script><style>'
       // ---- رنگ‌ها: همان نارنجی-قرمز برند سایت؛ سایدبار همیشه تیره ----
       . ':root{--p:#e8401a;--bg:#eef0f4;--card:#fff;--inp:#fff;--t:#1c2230;--m:#667085;--b:#dde1e9;--side:#141821;--sidet:#aab2c5;--r:12px;--st:env(safe-area-inset-top,0px);--sr:env(safe-area-inset-right,0px);--sl:env(safe-area-inset-left,0px)}'
       . '*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}'
       . 'body{margin:0;background:var(--bg);color:var(--t);font-family:Tahoma,"Segoe UI",system-ui,sans-serif;line-height:1.75;font-size:14.5px}'
       . 'a{color:var(--p)}'
       . '.ic{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;flex-shrink:0}'
       // ---- قاب کلی: سایدبار سمت راست + محتوا ----
       . '.app{min-height:100vh;min-height:100dvh}'
       . '.side{position:fixed;inset:0 0 0 auto;width:236px;background:var(--side);color:var(--sidet);display:flex;flex-direction:column;padding:20px 14px;z-index:20}'
       . '.brand{display:flex;align-items:center;gap:11px;padding:4px 8px 22px}'
       . '.brand-mark{width:38px;height:38px;border-radius:11px;background:var(--p);color:#fff;display:grid;place-items:center}'
       . '.brand b{display:block;color:#fff;font-size:1.02rem;line-height:1.3}.brand small{font-size:.76rem;color:var(--sidet)}'
       . '.snav{display:flex;flex-direction:column;gap:3px}.sfoot{margin-top:auto;display:flex;flex-direction:column;gap:3px;border-top:1px solid rgba(255,255,255,.09);padding-top:12px}'
       . '.snav a,.sfoot a,.sfoot button{display:flex;align-items:center;gap:11px;padding:10px 12px;border-radius:10px;color:var(--sidet);text-decoration:none;background:none;border:0;font:inherit;cursor:pointer;text-align:right;width:100%}'
       . '.snav a:hover,.sfoot a:hover,.sfoot button:hover{background:rgba(255,255,255,.07);color:#fff}'
       . '.snav a.on{background:rgba(232,64,26,.16);color:#fff;box-shadow:inset -3px 0 0 var(--p)}.snav a.on .ic{color:#ff7a57}'
       . '.main{margin-right:236px;padding:30px 36px 60px;max-width:1180px}'
       // ---- سرتیتر صفحه ----
       . '.ph{display:flex;justify-content:space-between;align-items:flex-end;gap:16px;margin-bottom:22px;flex-wrap:wrap}'
       . '.ph h1{font-size:1.65rem;margin:0;line-height:1.35}.ph p{margin:3px 0 0;color:var(--m);font-size:.9rem}'
       // ---- دکمه‌ها ----
       . '.btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;min-height:42px;background:var(--p);color:#fff;border:1px solid var(--p);border-radius:10px;padding:0 18px;font:inherit;font-weight:700;cursor:pointer;text-decoration:none;transition:filter .15s}'
       . '.btn:hover{filter:brightness(1.08)}.btn .ic{width:18px;height:18px}'
       . '.btn.alt{background:var(--card);color:var(--t);border-color:var(--b);font-weight:400}.btn.alt:hover{filter:none;border-color:var(--m)}'
       . '.btn.danger{background:var(--card);color:#b3261e;border-color:#ebc4c0;font-weight:400}.btn.danger:hover{filter:none;background:#fdeeee}'
       . '.btn.sm{min-height:34px;padding:0 13px;font-size:.84rem}'
       . 'a:focus-visible,button:focus-visible,input:focus-visible,select:focus-visible,textarea:focus-visible{outline:3px solid rgba(232,64,26,.45);outline-offset:2px}'
       // ---- فرم ----
       . 'label{display:block;font-weight:700;margin:15px 0 5px;font-size:.9rem}label:first-child{margin-top:0}.hint{color:var(--m);font-size:.8rem;font-weight:400}'
       . 'input[type=text],input[type=password],input[type=number],select,textarea{width:100%;min-height:42px;padding:9px 12px;border:1px solid var(--b);border-radius:10px;font:inherit;background:var(--inp);color:var(--t);transition:border-color .15s,box-shadow .15s}'
       . 'input:focus,select:focus,textarea:focus{border-color:var(--p);box-shadow:0 0 0 3px rgba(232,64,26,.15);outline:0}'
       . 'input[type=checkbox]{accent-color:var(--p);width:17px;height:17px;vertical-align:-3px;margin-left:6px}'
       . 'input[type=file]{font:inherit;max-width:100%}'
       . 'textarea{min-height:120px;resize:vertical}.row{display:grid;grid-template-columns:1fr 1fr;gap:14px}'
       . '.ltr{direction:ltr;text-align:left}.card{background:var(--card);border:1px solid var(--b);border-radius:var(--r);padding:22px;margin-bottom:18px}'
       . '.card h1{font-size:1.05rem;margin:0 0 6px}'
       // ---- بخش‌بندی فرم: عنوان کنار فیلدها ----
       . '.fs{display:grid;grid-template-columns:210px 1fr;gap:26px;padding:26px 0;border-top:1px solid var(--b)}.fs:first-of-type{border-top:0;padding-top:4px}'
       . '.fh h2{font-size:1rem;margin:0 0 4px}.fh p{margin:0;color:var(--m);font-size:.82rem;line-height:1.7}'
       . '.fb h2{font-size:.95rem;margin:16px 0 4px}.fb>.row{margin-top:16px}.fb>.row:first-child{margin-top:0}.fb>.row>div>label:first-child{margin-top:0}'
       . '.formcard{background:var(--card);border:1px solid var(--b);border-radius:var(--r);padding:12px 28px 4px;margin-bottom:90px}'
       . '.actions{position:fixed;bottom:0;right:236px;left:0;width:auto;display:flex;gap:10px;justify-content:flex-start;background:var(--card);border:0;border-top:1px solid var(--b);border-radius:0;padding:12px 36px calc(12px + env(safe-area-inset-bottom));box-shadow:0 -6px 24px rgba(20,24,33,.12);z-index:30;transform:translateZ(0)}'
       // ---- پیام‌ها ----
       . '.msg{padding:12px 16px;border-radius:10px;margin-bottom:16px;white-space:pre-line;border:1px solid}'
       . '.msg.ok{background:#e6f5ec;border-color:#9fd3b3;color:#17603a}.msg.err{background:#fdeceb;border-color:#efb5b0;color:#8f1d16}'
       // ---- آمار ----
       . '.stats{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:22px}'
       . '.stat{background:var(--card);border:1px solid var(--b);border-radius:10px;padding:8px 16px;display:flex;align-items:baseline;gap:8px}'
       . '.stat b{font-size:1.25rem}.stat span{color:var(--m);font-size:.84rem}.stat.warn b{color:#b45309}'
       // ---- کارت نویسنده ----
       . '.shelf{display:grid;grid-template-columns:repeat(auto-fill,minmax(188px,1fr));gap:16px}'
       . '.ac{background:var(--card);border:1px solid var(--b);border-radius:var(--r);overflow:hidden;display:flex;flex-direction:column}'
       . '.ac .pic{aspect-ratio:3/4;width:100%;object-fit:cover;display:block;background:#e7e9ee}'
       . '.ac .nopic{aspect-ratio:3/4;display:grid;place-items:center;align-content:center;gap:6px;background:repeating-linear-gradient(135deg,rgba(128,128,128,.07) 0 9px,transparent 9px 18px);border-bottom:1px dashed var(--b);color:var(--m);font-size:.78rem}'
       . '.ac .nopic span:first-child{font-size:2.6rem;line-height:1}'
       . '.ac .body{padding:12px 14px 6px;flex:1}.ac .nm{font-weight:700;font-size:1rem;line-height:1.5}.ac .en{color:var(--m);font-size:.8rem;direction:ltr;text-align:right}'
       . '.ac .meta{display:flex;flex-wrap:wrap;gap:6px;margin-top:9px;align-items:center;font-size:.8rem}'
       . '.ac .pg{display:flex;align-items:stretch;gap:6px;direction:rtl;margin-top:10px}.ac .pg a.pl{flex:1;min-width:0;display:inline-flex;align-items:center;justify-content:center;gap:5px;padding:7px 8px;border:1px solid var(--b);border-radius:9px;background:var(--card);color:var(--t);font-size:.8rem;font-weight:600;text-decoration:none;white-space:nowrap;transition:border-color .15s,color .15s}.ac .pg a.pl:hover,.ac .pg a.pl:focus-visible{border-color:var(--p);color:var(--p)}.ac .pg a.pl .en-tag{direction:ltr;letter-spacing:.3px}.ac .pg .ic{width:14px;height:14px;flex:none}'
       . '.ac .acts{display:flex;gap:8px;padding:10px 14px 14px}.ac .acts form{flex:1;margin:0}.ac .acts .btn{width:100%}.ac .acts>a{flex:1}'
       . '.tag{font-size:.74rem;border-radius:20px;padding:1px 10px;background:#eceef3;color:#475066;display:inline-block}.tag.ok{background:#e6f5ec;color:#17603a}.tag.no{background:#fff1d9;color:#8a5200}'
       . '.thumb{width:80px;height:108px;object-fit:cover;border-radius:8px;background:#e7e9ee;vertical-align:middle}'
       // ---- کارت بررسی عکس (admin-users.js) ----
       . '.review-card{display:flex;gap:14px;align-items:center;border:1px solid var(--b);border-radius:10px;padding:12px;margin-bottom:10px;flex-wrap:wrap}'
       . '.review-card img{width:64px;height:64px;border-radius:10px;object-fit:cover;flex-shrink:0}'
       // ---- تم ----
       . '.adm-themebox{display:none;position:fixed;right:252px;bottom:16px;width:330px;max-width:calc(100vw - 24px);padding:14px;background:linear-gradient(var(--card),var(--card)),var(--bg);background-color:var(--bg);border:1px solid var(--b);border-radius:14px;box-shadow:0 12px 36px rgba(20,24,33,.28);z-index:40;isolation:isolate}'
       . '.adm-themebox.open{display:block}.adm-themebox .hint{display:block;margin-bottom:8px}'
       . '.adm-dot{display:inline-block;width:30px;height:30px;border-radius:50%;margin:3px;cursor:pointer;border:2px solid rgba(128,128,128,.45)}.adm-dot.on{outline:3px solid var(--p);outline-offset:1px}'
       . 'html.adm-dark .msg.ok{background:#1d3a2a;border-color:#2f6b4a;color:#a8e3c1}html.adm-dark .msg.err{background:#4a1f1f;border-color:#7a3333;color:#ffb4ac}'
       . 'html.adm-dark .tag{background:rgba(255,255,255,.12);color:#d5dae6}html.adm-dark .tag.ok{background:#1d3a2a;color:#a8e3c1}html.adm-dark .tag.no{background:#4a3a1a;color:#ffd699}'
       . 'html.adm-dark .btn.danger{color:#ff8a80;border-color:#7a3333}html.adm-dark .btn.danger:hover{background:#3a1a1a}html.adm-dark .thumb,html.adm-dark .ac .pic{background:#333}'
       // ---- ورود ----
       . '.login{min-height:100vh;min-height:100dvh;display:grid;place-items:center;padding:calc(20px + var(--st)) calc(20px + var(--sr)) calc(20px + env(safe-area-inset-bottom)) calc(20px + var(--sl));background:var(--side)}'
       . '.login .box{width:100%;max-width:380px;background:var(--card);border-radius:16px;padding:30px 28px}'
       . '.login .brand{padding:0 0 20px}.login .brand b{color:var(--t)}.login .brand small{color:var(--m)}'
       . '.login h1{font-size:1.2rem;margin:0 0 4px}.login .btn{width:100%;margin-top:18px}'
       // ---- موبایل: سایدبار → نوار پایین ----
       . '@media(max-width:860px){.fs{grid-template-columns:1fr;gap:12px}.formcard{padding:6px 18px 4px}}'
       . '.morebtn{display:none}'
       . '@media(max-width:760px){'
       .   '.side{inset:auto 0 0 0;width:auto;flex-direction:row;padding:6px calc(6px + var(--sr)) calc(6px + env(safe-area-inset-bottom)) calc(6px + var(--sl));border-top:1px solid rgba(255,255,255,.1);gap:2px}'
       .   '.brand{display:none}.snav{flex-direction:row;flex:1;margin:0;border:0;padding:0;gap:2px;min-width:0}'
       .   '.snav a,.morebtn{display:flex;align-items:center;flex-direction:column;gap:2px;justify-content:center;padding:6px 2px;font-size:.68rem;text-align:center;min-height:52px;min-width:0;flex:1 1 0;width:auto;position:relative;border-radius:10px;color:var(--sidet);background:none;border:0;font-family:inherit;cursor:pointer;text-decoration:none}'
       .   '.morebtn[aria-expanded=true]{background:rgba(255,255,255,.1);color:#fff}'
       .   '.morebtn{flex:0 0 17%}'
       .   '.sfoot{display:none;position:fixed;right:calc(8px + var(--sr));left:calc(8px + var(--sl));bottom:calc(68px + env(safe-area-inset-bottom));background:var(--side);border:1px solid rgba(255,255,255,.16);border-radius:14px;padding:6px;margin:0;flex-direction:column;gap:2px;box-shadow:0 14px 40px rgba(0,0,0,.45);z-index:30}'
       .   '.side.more .sfoot{display:flex}.side.more{z-index:40}'
       .   '.sfoot a,.sfoot button{flex-direction:row;justify-content:flex-start;gap:12px;padding:12px 14px;min-height:48px;font-size:.92rem;width:100%}'
       .   '.sfoot .lg{display:inline}.sfoot .sh{display:none}'
       .   '.snav a.on{box-shadow:inset 0 3px 0 var(--p)}'
       // لیبل‌های نوار پایین هیچ‌وقت با «…» بریده نشوند: اگر جا نبود، می‌شکنند؛ روی گوشی‌های باریک فونت و فاصله کمی کوچک‌تر می‌شود
       .   '.side .snav a span{white-space:normal;overflow:visible;text-overflow:clip;line-height:1.3;overflow-wrap:break-word}'
       .   '.main{margin:0;padding:calc(18px + var(--st)) calc(16px + var(--sr)) calc(96px + env(safe-area-inset-bottom)) calc(16px + var(--sl))}.ph h1{font-size:1.35rem}'
       .   '.row{grid-template-columns:1fr}.shelf{grid-template-columns:repeat(2,1fr);gap:12px}.ac .acts{flex-direction:column}'
       .   '.adm-themebox{right:calc(12px + var(--sr));left:calc(12px + var(--sl));bottom:calc(76px + env(safe-area-inset-bottom));width:auto}'
       .   '.actions{bottom:calc(66px + env(safe-area-inset-bottom));right:0;left:0;width:auto;padding:10px calc(16px + var(--sr)) 10px calc(16px + var(--sl))}.formcard{margin-bottom:110px}'
       .   'input[type=text],input[type=password],input[type=number],select,textarea{font-size:16px}'
       .   '.review-card>div:last-child{flex-direction:row!important;width:100%}.review-card>div:last-child .btn{flex:1}}'
       . '@media(max-width:400px){.side{padding-left:calc(3px + var(--sl));padding-right:calc(3px + var(--sr));gap:0}.snav{gap:0}.snav a,.morebtn{font-size:.64rem;padding:6px 0}.morebtn{flex:0 0 14%}}'
       . '@media(max-width:340px){.snav a,.morebtn{font-size:.6rem}.snav a .ic,.morebtn .ic{width:18px;height:18px}}'
       . '.sh{display:none}@media(max-width:760px){.lg{display:none}.sh{display:inline}.stats{gap:8px}.stat{padding:5px 12px}.stat b{font-size:1.1rem}.stat span{font-size:.78rem}}'
       // ---- داشبورد و کاربران ----
       . '.kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-bottom:20px}'
       . '.kpi{background:var(--card);border:1px solid var(--b);border-radius:var(--r);padding:14px 16px;text-decoration:none;color:var(--t);display:block}'
       . '.kpi b{display:block;font-size:1.7rem;line-height:1.4}.kpi span{color:var(--m);font-size:.84rem}a.kpi:hover{border-color:var(--m)}.kpi.warn b{color:#b45309}.kpi.hot{border-color:var(--p)}.kpi.hot b{color:var(--p)}'
       . '.two{display:grid;grid-template-columns:1fr 1fr;gap:18px;align-items:start}.two .card{margin-bottom:0}'
       . '.qa{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:20px}.card h2{font-size:.95rem;margin:16px 0 4px}.card h2:first-child{margin-top:0}'
       . '.rw{display:flex;align-items:center;gap:12px;padding:9px 0;border-top:1px solid var(--b);font-size:.88rem}.rw:first-of-type{border-top:0}.rw .grow{flex:1;min-width:0}.rw small{color:var(--m)}'
       . '.okline{color:#17603a;font-size:.88rem;padding:6px 0}html.adm-dark .okline{color:#a8e3c1}'
       . '.badge{display:inline-grid;place-items:center;min-width:19px;height:19px;padding:0 5px;border-radius:10px;background:var(--p);color:#fff;font-size:.7rem;font-style:normal;font-weight:700;margin-right:auto}.badge[hidden]{display:none}'
       . '.snav a{position:relative}.tag.hot{background:#ffe3d9;color:#a3300f}html.adm-dark .tag.hot{background:#4a2a1f;color:#ffb89f}'
       . '.ubar{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:6px}.ubar input{flex:1;min-width:200px}'
       . '.urow{display:flex;align-items:center;gap:12px;padding:10px 2px;border-top:1px solid var(--b)}.upick{display:flex;align-items:center;margin:0;cursor:pointer}.upick input{width:20px;height:20px;margin:0;cursor:pointer}.urow .grow{flex:1;min-width:0;font-size:.88rem}.urow small{color:var(--m)}'
       . '.uav{width:42px;height:42px;border-radius:50%;background:rgba(128,128,128,.15);display:grid;place-items:center;font-size:1.4rem;overflow:hidden;flex-shrink:0}.uav img{width:100%;height:100%;object-fit:cover}'
       . '.chips{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 6px}.chip{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--b);background:var(--inp);color:var(--t);border-radius:20px;padding:3px 12px;font:inherit;font-size:.84rem;cursor:pointer}'
       . '.chip:hover{border-color:var(--p)}.chip i{font-style:normal;color:var(--m);padding:0 2px}.chip i:hover{color:#b3261e}'
       . '.sugg{position:relative}.sugg-box{position:absolute;left:0;right:0;z-index:10;background:var(--card);border:1px solid var(--b);border-radius:10px;box-shadow:0 10px 28px rgba(20,24,33,.18);max-height:240px;overflow:auto;margin-top:4px}'
       . '.sugg-box button{display:flex;width:100%;gap:10px;align-items:center;padding:9px 12px;background:none;border:0;font:inherit;color:var(--t);cursor:pointer;text-align:right}.sugg-box button:hover{background:rgba(128,128,128,.12)}'
       . '.bulk{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin:12px 0}.bulk label{margin:0;font-weight:400;display:flex;align-items:center}'
       . '.review-card img{width:96px;height:96px;cursor:zoom-in}.review-card input[type=checkbox]{margin:0 0 0 4px;flex-shrink:0}'
       . '.lb{position:fixed;inset:0;background:rgba(10,12,18,.82);z-index:100;display:none;place-items:center;padding:16px}.lb.open{display:grid}'
       . '.lb-in{background:var(--card);color:var(--t);border-radius:14px;max-width:560px;width:100%;max-height:100%;overflow:auto;padding:14px}'
       . '.lb-in img{width:100%;max-height:62vh;max-height:62dvh;object-fit:contain;border-radius:10px;background:rgba(128,128,128,.2);display:block}.lb-acts{display:flex;gap:10px;margin-top:12px}.lb-acts .btn{flex:1}'
       . '@media(max-width:860px){.two{grid-template-columns:1fr}}'
       . '@media(max-width:760px){.snav a .badge{position:absolute;top:2px;left:calc(50% - 24px);margin:0}.urow{flex-wrap:wrap}.kpi b{font-size:1.4rem}}'
       // ---- امنیت ----
       . '.keybox{direction:ltr;font-family:Consolas,monospace;font-size:1.2rem;letter-spacing:2px;background:var(--inp);border:1px dashed var(--b);border-radius:10px;padding:12px 14px;word-break:break-all;user-select:all;margin:8px 0}'
       . '.btns{display:flex;gap:10px;flex-wrap:wrap;margin:10px 0}.card form{margin:0}.card .row{margin-top:0}.sec-note{background:rgba(180,83,9,.1);border:1px solid rgba(180,83,9,.35);border-radius:10px;padding:10px 14px;font-size:.84rem;margin:12px 0}'
       . '.rw form{display:inline}.rw .btn{margin-right:6px}.snav a span,.sfoot span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}'
       // ---- فقط دسکتاپ: فونت خواناتر + فاصله‌های خالی کمتر (موبایل دست‌نخورده) ----
       . '@media(min-width:761px){'
       .   'body{font-family:"Vazirmatn","Vazir","IRANSans","Segoe UI",Tahoma,system-ui,sans-serif;font-size:15px;line-height:1.7;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}'
       .   'button,input,select,textarea{font-family:inherit}select option,select optgroup{background:#fff;color:var(--t)}html.adm-dark select{color-scheme:dark}html.adm-dark select option,html.adm-dark select optgroup{background:var(--bg);color:#f5f6fa}input,textarea,select{-webkit-user-select:text;user-select:text}body{-webkit-touch-callout:default}'
       .   '.side{width:calc(212px + var(--sr));padding:calc(16px + var(--st)) calc(12px + var(--sr)) calc(16px + env(safe-area-inset-bottom)) 12px;overflow-y:auto;overscroll-behavior:contain;scrollbar-width:thin;scrollbar-color:rgba(255,255,255,.25) transparent}.brand{padding:2px 8px 16px}.snav a,.sfoot a,.sfoot button{padding:8px 12px}'
       .   '.main{margin-right:calc(212px + var(--sr));padding:calc(20px + var(--st)) 28px 44px calc(28px + var(--sl));max-width:1500px}'
       .   '.actions{right:calc(212px + var(--sr));padding:10px 28px calc(10px + env(safe-area-inset-bottom)) calc(28px + var(--sl))}.adm-themebox{right:calc(228px + var(--sr))}'
       .   '.ph{margin-bottom:14px}.ph h1{font-size:1.55rem}'
       .   '.msg{padding:9px 14px;margin-bottom:10px}'
       .   '.card{padding:18px;margin-bottom:14px}label{margin:12px 0 4px}'
       .   '.stats,.kpis,.qa{margin-bottom:14px}.kpis{gap:10px}.kpi{padding:11px 14px}.two{gap:14px}'
       .   '.rw{padding:6px 0}.urow{padding:8px 2px}.shelf{gap:14px}.card h2{margin:12px 0 4px}'
       .   '.formcard{padding:6px 24px 2px;margin-bottom:76px}'
       .   '.tbl th,.tbl td{padding:7px 10px}.tools{margin-bottom:10px}.pager{margin:12px 0}'
       .   '}'
       // ---- حالت افقیِ گوشی (عرض ۷۶۱ به بالا ولی ارتفاع کم): سایدبار فشرده‌تر تا «رنگ پنل» و «خروج» بدون اسکرول هم دیده بشن؛
       //      اگه باز هم جا نشد (صفحه‌ی خیلی کوتاه)، overflow-y:auto بالا اجازه‌ی اسکرول داخل سایدبار می‌ده ----
       . '@media(min-width:761px) and (max-height:520px){.side{padding:calc(8px + var(--st)) calc(10px + var(--sr)) calc(8px + env(safe-area-inset-bottom)) 10px}.brand{padding:0 8px 6px;gap:9px}.brand-mark{width:28px;height:28px;border-radius:8px}.brand small{display:none}'
       .   '.snav{gap:1px}.sfoot{padding-top:6px;gap:1px}.snav a,.sfoot a,.sfoot button{padding:5px 10px;line-height:1.5}'
       .   '.adm-themebox{max-height:calc(100vh - 32px);max-height:calc(100dvh - 32px);overflow-y:auto}}'
       . '@media(min-width:861px){.fs{grid-template-columns:200px 1fr;gap:22px;padding:18px 0}.fs:first-of-type{padding-top:2px}.fb h2{margin:12px 0 4px}.fb>.row{margin-top:12px}.row{gap:12px}}'
       // ---- کیبورد باز (فقط لمسی): نوار «ذخیره/انصراف» و نوار ناوبری پایین روی فیلد در حال تایپ نیفتن ----
       //      کلاس kb را اسکریپتِ انتهای صفحه موقع فوکوس روی فیلد متنی می‌گذارد (وقتی کیبورد باز است)؛ نوار ناوبری مخفی و نوار ذخیره از حالت «ثابت» به «همان زیر فرم» برمی‌گردد ----
       . '@media(pointer:coarse){html.kb .actions{position:static;box-shadow:none;transform:none}html.kb .formcard{margin-bottom:12px}}'
       .   '@media(max-width:760px) and (pointer:coarse){html.kb .side{display:none}}'
       // ---- جلوگیری از زوم خودکار آیفون: هر فیلدی با فونت زیر ۱۶px موقع فوکوس صفحه را بزرگ می‌کند.
       //      قبلاً فقط عرض ≤۷۶۰ را می‌گرفت (آیفون افقی، ۷۶۱+ ، جا می‌ماند) و input[type=file] هم داخل لیست نبود (فونت: inherit ← ۱۴.۵/۱۵px) ----
       . '@media(max-width:760px),(pointer:coarse){input:not([type=checkbox]):not([type=radio]):not([type=hidden]):not([type=range]):not([type=color]),select,textarea{font-size:16px}}'
       // ---- انتخاب فایل: دکمه و متنِ فارسیِ هم‌شکل با پنل (متن پیش‌فرض مرورگر «Choose File / No file chosen» را نمی‌شود با CSS عوض کرد) ----
       . '.fpick{display:block;margin:6px 0}.fp-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap}'
       . '.fp-name{flex:1;min-width:0;color:var(--m);font-size:.86rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.fp-name.has{color:var(--t)}'
       . 'input[type=file].fp-in{position:absolute;width:1px;height:1px;opacity:0;overflow:hidden;clip:rect(0 0 0 0);pointer-events:none}'
       // ---- لمس: هدف‌های لمسی حداقل ~۴۴px (دکمه‌ها، لینک‌ها، چک‌باکس‌ها) ----
       //      چک‌باکس خودش ۲۴px می‌شود و لیبلِ دور آن (کل ردیف) ۴۴px ارتفاع و قابل‌لمس است ----
       . '@media(pointer:coarse),(max-width:760px){input[type=checkbox],input[type=radio]{width:24px;height:24px}'
       .   'label:has(>input[type=checkbox]){display:block;min-height:44px;padding:10px 0;line-height:1.7}label>input[type=checkbox]{flex-shrink:0;vertical-align:middle;margin:0 0 0 8px}'
       .   '.btn.sm{min-height:44px}.chip{min-height:44px;padding:3px 14px}.chip i{padding:12px 8px;margin:-12px -4px}'
       .   '.msg a{display:inline-block;padding:12px 6px;margin:-12px -6px}'
       .   '.rj-list label{min-height:44px;display:flex;align-items:center}}'
       // ---- نوار پایین فرم‌ها در گوشی: جمع‌وجورتر + با اسکرول به پایین نوار ناوبری مخفی می‌شود (با اسکرول به بالا برمی‌گردد) ----
       . '@media(max-width:760px){html.hasact .side{padding-top:3px;padding-bottom:calc(3px + env(safe-area-inset-bottom))}'
       .   'html.hasact .snav a,html.hasact .morebtn{min-height:46px}'
       .   'html.hasact .actions{bottom:calc(53px + env(safe-area-inset-bottom));padding-top:8px;padding-bottom:8px}'
       .   'html.hasact .side,html.hasact .actions{transition:transform .2s ease,bottom .2s ease}'
       .   'html.hasact.navhide .side{transform:translateY(100%)}'
       .   'html.hasact.navhide .actions{bottom:0;padding-bottom:calc(8px + env(safe-area-inset-bottom))}}'
       . '@media(prefers-reduced-motion:reduce){html.hasact .side,html.hasact .actions{transition:none}}'
       . feedback_css()
       . '</style></head><body>';
}

function shell_open($active) {
    global $SHELL;
    $SHELL = true;
    echo '<div class="app"><aside class="side">'
       . '<div class="brand"><div class="brand-mark">' . icon('book') . '</div><div><b>PDF مارکت</b><small>پنل مدیریت</small></div></div>'
       . '<nav class="snav"><a href="admin.php"' . ($active === 'home' ? ' class="on"' : '') . '>' . icon('home') . '<span>داشبورد</span></a>'
       . '<a href="admin.php?a=list"' . ($active === 'authors' ? ' class="on"' : '') . '>' . icon('book') . '<span>نویسنده‌ها</span></a>'
       . '<a href="admin.php?a=books"' . ($active === 'books' ? ' class="on"' : '') . '>' . icon('book') . '<span>کتاب‌ها</span></a>'
       . '<a href="admin.php?a=featured"' . ($active === 'featured' ? ' class="on"' : '') . '>' . icon('users') . '<span class="lg">کادر چهره‌ها</span><span class="sh">چهره‌ها</span></a>'
       . '<a href="admin.php?a=users"' . ($active === 'users' ? ' class="on"' : '') . '>' . icon('users') . '<span>کاربران</span><i class="badge" id="navUsersBadge" hidden></i></a>'
       . '<a href="admin.php?a=security"' . ($active === 'security' ? ' class="on"' : '') . '>' . icon('shield') . '<span>امنیت</span></a></nav>'
       . '<button type="button" class="morebtn" id="admMoreBtn" aria-expanded="false" aria-controls="admSfoot">' . icon('more') . '<span>بیشتر</span></button>'
       . '<div class="sfoot" id="admSfoot"><a href="index.html" target="_blank">' . icon('site') . '<span class="lg">مشاهده‌ی سایت</span><span class="sh">سایت</span></a>'
       . '<button type="button" id="admThemeBtn">' . icon('theme') . '<span>رنگ پنل</span></button>'
       . '<a href="admin.php?a=logout">' . icon('logout') . '<span>خروج</span></a></div></aside>'
       // منوی «بیشتر» فقط در موبایل: سایت / رنگ پنل / خروج داخل یک پنجره‌ی کوچک باز می‌شوند
       . '<script>(function(){var s=document.querySelector(".side"),b=document.getElementById("admMoreBtn"),t=document.getElementById("admThemeBtn");if(!s||!b)return;'
       . 'function set(o){s.classList.toggle("more",o);b.setAttribute("aria-expanded",o?"true":"false");}'
       . 'b.addEventListener("click",function(e){e.stopPropagation();set(!s.classList.contains("more"));});'
       . 'if(t)t.addEventListener("click",function(){set(false);});'
       . 'document.addEventListener("click",function(e){if(s.classList.contains("more")&&!s.contains(e.target))set(false);'
       . 'var tb=document.getElementById("admThemeBox");if(tb&&tb.classList.contains("open")&&window.matchMedia("(max-width:760px)").matches&&!tb.contains(e.target)&&!(t&&t.contains(e.target)))tb.classList.remove("open");});'
       . 'document.addEventListener("keydown",function(e){if(e.key==="Escape")set(false);});})();</script><main class="main">';
}

function page_head($title, $sub = '', $actionHtml = '') {
    echo '<div class="ph"><div><h1>' . $title . '</h1>' . ($sub !== '' ? '<p>' . $sub . '</p>' : '') . '</div>' . $actionHtml . '</div>';
}

// بخش‌بندی فرم (عنوان و توضیح کنار فیلدها)
function fs($t, $d = '') {
    global $FS_OPEN;
    if (!empty($FS_OPEN)) echo '</div></section>';
    $FS_OPEN = true;
    echo '<section class="fs"><div class="fh"><h2>' . $t . '</h2>' . ($d !== '' ? '<p>' . $d . '</p>' : '') . '</div><div class="fb">';
}
function fs_end() { global $FS_OPEN; if (!empty($FS_OPEN)) echo '</div></section>'; $FS_OPEN = false; }

// دکمه‌ی «چشم» کنار همه‌ی فیلدهای رمز عبور (ورود و تغییر رمز): با کلیک رمز تایپ‌شده دیده می‌شود
function eye_js() {
    $js = <<<'JS'
(function(){
var open='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
var shut='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';
document.querySelectorAll('input[type=password]').forEach(function(i){
var w=document.createElement('span');w.style.cssText='position:relative;display:block';
i.parentNode.insertBefore(w,i);w.appendChild(i);i.style.paddingLeft='46px';
var b=document.createElement('button');b.type='button';b.setAttribute('aria-label','نمایش رمز عبور');b.title='نمایش رمز عبور';
b.style.cssText='position:absolute;left:6px;top:50%;transform:translateY(-50%);width:34px;height:34px;border:0;background:transparent;color:inherit;opacity:.65;cursor:pointer;display:grid;place-items:center;padding:0;margin:0;border-radius:8px;min-height:0';
b.innerHTML=open;
b.onclick=function(){var hidden=i.type==='password';i.type=hidden?'text':'password';b.innerHTML=hidden?shut:open;b.title=hidden?'پنهان کردن رمز عبور':'نمایش رمز عبور';i.focus();};
w.appendChild(b);});
})();
JS;
    return '<script>' . $js . '</script>';
}

function layout_end() {
    global $SHELL;
    echo !empty($SHELL) ? '</main></div><script>(function(){var h=document.documentElement,t=null,T=/^(text|search|email|url|tel|password|number|date|datetime-local|month|week|time)$/i;'
        . 'function kb(e){var n=e.target;if(!n||!n.tagName)return false;var g=n.tagName;return g==="TEXTAREA"||(g==="INPUT"&&T.test(n.type||"text"))||n.isContentEditable===true;}'
        . 'document.addEventListener("focusin",function(e){if(!kb(e))return;clearTimeout(t);h.classList.add("kb");},true);'
        . 'document.addEventListener("focusout",function(e){if(!kb(e))return;clearTimeout(t);t=setTimeout(function(){h.classList.remove("kb");},400);},true);})();</script>'
        . '<script>(function(){var s=document.querySelector(".side"),o=s&&s.querySelector(".snav a.on");if(o&&s.scrollWidth>s.clientWidth)s.scrollLeft=o.offsetLeft-(s.clientWidth-o.offsetWidth)/2;})();</script>' . feedback_js() . eye_js() . '</body></html>' : eye_js() . '</body></html>';
}


if (!$loggedIn) {
    $secL = sec_read(SEC_FILE);
    $codeField = (!empty($secL['totp_on']) && !empty($secL['totp_secret'])) ? '<label style="margin-top:14px">کد تأیید (۶ رقم از برنامه‌ی احراز هویت)</label><input type="text" name="code" class="ltr" inputmode="numeric" autocomplete="one-time-code" maxlength="8" required>' : '';
    layout_start('ورود ادمین');
    echo '<div class="login"><div class="box"><div class="brand"><div class="brand-mark">' . icon('book') . '</div><div><b>PDF مارکت</b><small>پنل مدیریت</small></div></div>'
       . '<h1>ورود به پنل ادمین</h1>';
    if ($flash) echo '<div class="msg ' . e($flash[0]) . '" style="margin-top:12px">' . e($flash[1]) . '</div>';
    echo '<form method="post" action="admin.php?a=login"><label style="margin-top:14px">رمز عبور</label>'
       . '<input type="password" name="password" autofocus required autocomplete="current-password">' . $codeField . '<button class="btn" type="submit">ورود</button></form></div></div>';
    layout_end(); exit;
}

if ($loggedIn && $action === 'dl') {
    $p = backup_path(isset($_GET['f']) ? (string)$_GET['f'] : '');
    if (!$p) { http_response_code(404); echo 'not found'; exit; }
    header('Content-Type: application/json; charset=utf-8');
    header('Content-Disposition: attachment; filename="' . basename($p) . '"');
    header('Content-Length: ' . filesize($p));
    readfile($p);
    exit;
}
if ($loggedIn && ($action === 'books_csv' || $action === 'authors_csv')) content_export($action);
// فهرست PDFهای ثبت‌شده در books.json: found = مسیر روی دیسک، missing = ثبت شده ولی فایلش پیدا نشد
function backup_pdf_inventory() {
    $found = array(); $missing = array(); $bytes = 0;
    foreach (read_books() as $bk) {
        $fn = isset($bk['pdf']['file']) ? (string)$bk['pdf']['file'] : '';
        if ($fn === '') continue;
        $path = pdf_path($bk);
        if ($path) { if (!isset($found[$fn])) { $found[$fn] = $path; $bytes += (int)@filesize($path); } }
        else $missing[$fn] = (string)($bk['title']['fa'] ?? $bk['id'] ?? $fn);
    }
    return array('found' => $found, 'missing' => $missing, 'bytes' => $bytes);
}
if ($loggedIn && $action === 'zip') {
    if (!class_exists('ZipArchive')) { flash('err', 'افزونه‌ی zip در PHP فعال نیست (در XAMPP: php.ini ← extension=zip).'); redirect('admin.php?a=security'); }
    // بخش‌های انتخاب‌شده: data = اطلاعات (نویسنده‌ها/کتاب‌ها/ژانرها/تنظیمات)، photos = عکس‌ها، pdfs = فایل‌های PDF کتاب‌ها
    $all = array('data', 'photos', 'pdfs');
    $parts = isset($_GET['p']) && is_array($_GET['p']) ? array_values(array_intersect($all, $_GET['p'])) : (isset($_GET['p']) ? array_values(array_intersect($all, explode(',', (string)$_GET['p']))) : $all);
    if (!$parts) { flash('err', 'حداقل یک بخش را برای پشتیبان انتخاب کن.'); redirect('admin.php?a=security'); }
    @set_time_limit(0);
    $tmp = tempnam(sys_get_temp_dir(), 'bk');
    $z = new ZipArchive();
    if ($tmp === false || $z->open($tmp, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) { flash('err', 'ساخت فایل پشتیبان ممکن نشد.'); redirect('admin.php?a=security'); }
    $fail = array(); $n = array('data' => 0, 'photos' => 0, 'pdfs' => 0); $missing = array();
    $add = function ($f, $name, $kind) use ($z, &$fail, &$n) {
        if ($z->addFile($f, $name)) $n[$kind]++; else $fail[] = $name;
    };
    if (in_array('data', $parts, true)) {
        foreach (array(AUTHORS_FILE, BOOKS_FILE, GENRES_FILE, FEATURED_FILE, __DIR__ . '/data/settings.json') as $f) {
            if (is_file($f)) $add($f, 'data/' . basename($f), 'data');
        }
    }
    if (in_array('photos', $parts, true)) {
        foreach (array(array(PHOTO_DIR, 'images/authors/'), array(FEATURED_DIR, 'images/featured/'), array(PHOTO_ORIG_DIR, 'data/photo-originals/'), array(BOOK_COVER_DIR, 'images/books/')) as $g) {
            $fl = glob($g[0] . '/*');
            if ($fl) foreach ($fl as $f) if (is_file($f) && basename($f) !== '.htaccess' && basename($f) !== 'index.html') $add($f, $g[1] . basename($f), 'photos');
        }
    }
    if (in_array('pdfs', $parts, true)) {
        $inv = backup_pdf_inventory();
        $missing = $inv['missing'];
        foreach ($inv['found'] as $fn => $path) $add($path, 'data/pdfs/' . $fn, 'pdfs');
    }
    $isFull = (count($parts) === count($all)) && !$missing;
    $info = "PDF Market backup — " . date('Y-m-d H:i:s') . "\r\n"
          . "Parts: " . implode(', ', $parts) . "\r\n"
          . "Files: data=" . $n['data'] . " photos=" . $n['photos'] . " pdfs=" . $n['pdfs'] . "\r\n"
          . "Complete: " . ($isFull ? 'yes (data + photos + pdfs)' : 'NO - partial backup') . "\r\n";
    if (count($parts) < count($all)) $info .= "Not included: " . implode(', ', array_diff($all, $parts)) . "\r\n";
    if ($missing) { $info .= "\r\nMISSING PDF files (listed in books.json but not found on disk):\r\n"; foreach ($missing as $fn => $t) $info .= " - " . $fn . "  (" . $t . ")\r\n"; }
    $z->addFromString('BACKUP-INFO.txt', $info);
    $closed = !$fail && $z->close();
    if ($fail) @$z->close();
    if (!$closed) {
        @unlink($tmp);
        flash('err', 'ساخت پشتیبان کامل نشد و دانلود نشد' . ($fail ? ' — این فایل‌ها به ZIP اضافه نشدند: ' . implode('، ', array_slice($fail, 0, 5)) . (count($fail) > 5 ? ' …' : '') : ' — نوشتن ZIP شکست خورد (فضای دیسک یا مجوز پوشه‌ی موقت را بررسی کن).'));
        redirect('admin.php?a=security');
    }
    if ($missing) flash('err', 'هشدار: پشتیبان ساخته شد ولی ' . count($missing) . ' فایل PDF ثبت‌شده روی دیسک پیدا نشد و در آن نیست (فهرستشان در BACKUP-INFO.txt داخل ZIP است).');
    $tag = $isFull ? 'full' : (count($parts) < count($all) ? implode('-', $parts) : 'partial');
    header('Content-Type: application/zip');
    header('Content-Disposition: attachment; filename="pdf-market-backup-' . $tag . '-' . date('Ymd-His') . '.zip"');
    header('Content-Length: ' . filesize($tmp));
    readfile($tmp);
    @unlink($tmp);
    exit;
}

$authors = in_array($action, array('security', 'bk_diff'), true) ? array() : read_authors();
layout_start('پنل ادمین | PDF مارکت');
shell_open($action === 'featured' ? 'featured' : (in_array($action, array('books', 'book_edit'), true) ? 'books' : ($action === 'users' ? 'users' : ($action === 'home' ? 'home' : (in_array($action, array('security', 'bk_diff'), true) ? 'security' : 'authors')))));
echo '<div class="adm-themebox" id="admThemeBox"><span class="hint">رنگ زمینه‌ی پنل ادمین (فقط برای خودت؛ به ظاهر سایت ربطی ندارد)</span><div id="admDots"></div>'
   . '<p style="margin:8px 0 0"><button class="btn alt sm" type="button" id="admThemeReset">بازگشت به رنگ پیش‌فرض</button></p></div>';
echo '<script>(function(){var C=["#faf6f0","#ffffff","#f8f4ec","#f0f0f2","#fffdf5","#ebe6dd","#f4b8c8","#f8c4a4","#f5dc86","#bfe0a4","#a9dfc6","#a6dade","#b3cdf0","#bcc2f0","#d0baee","#eab8dd","#f4ecd8","#f3e5c8","#fbf1dc","#f1d9a8","#ecc9a0","#f0d2c0","#e6d3b3","#f6dfae","#e8eee2","#f0e6da","#121212","#0f172a","#1e293b","#212529","#1e272e","#2b262d","#222831","#1f2421","#0d1b2a","#1a0f14","#191424","#241c15","#13231d","#161b2e","#22201c","#0f2429"];'
   . 'var box=document.getElementById("admThemeBox"),dots=document.getElementById("admDots"),cur=null;try{cur=localStorage.getItem("adm_theme_color");}catch(e){}'
   . 'function mark(){var a=dots.children;for(var i=0;i<a.length;i++)a[i].className="adm-dot"+(a[i].getAttribute("data-c")===cur?" on":"");}'
   . 'C.forEach(function(c){var d=document.createElement("span");d.className="adm-dot";d.style.background=c;d.setAttribute("data-c",c);d.title=c;'
   . 'd.onclick=function(){cur=c;window.admApplyTheme(c);try{localStorage.setItem("adm_theme_color",c);}catch(e){}mark();};dots.appendChild(d);});mark();'
   . 'var tbtn=document.getElementById("admThemeBtn");tbtn.onclick=function(){box.classList.toggle("open");};'
   . 'document.addEventListener("click",function(e){if(box.classList.contains("open")&&!box.contains(e.target)&&!tbtn.contains(e.target))box.classList.remove("open");});'
   . 'document.addEventListener("keydown",function(e){if(e.key==="Escape")box.classList.remove("open");});'
   . 'document.getElementById("admThemeReset").onclick=function(){cur=null;window.admResetTheme();try{localStorage.removeItem("adm_theme_color");}catch(e){}mark();};})();</script>';
// دکمه‌ی برگشتِ گوشی: اول منوی «بیشتر» / پنجره‌ی رنگ پنل را می‌بندد، نه اینکه صفحه را ترک کند
echo <<<'JS'
<script>(function(){
  var s=document.querySelector(".side"),b=document.getElementById("admMoreBtn"),tb=document.getElementById("admThemeBox");
  var de=document.documentElement;
  function initAct(){
    if(!s||!document.querySelector(".actions"))return;
    de.classList.add("hasact");
    var last=window.pageYOffset||0,mq=window.matchMedia("(max-width:760px)");
    window.addEventListener("scroll",function(){
      var y=window.pageYOffset||0,d=y-last;
      if(Math.abs(d)<10)return;
      last=y;
      var open=s.classList.contains("more")||(tb&&tb.classList.contains("open"));
      de.classList.toggle("navhide",mq.matches&&d>0&&y>80&&!open);
    },{passive:true});
  }
  /* این اسکریپت قبل از محتوای صفحه چاپ می‌شود؛ پس تا DOM کامل نشده نوار «ذخیره/انصراف» دیده نمی‌شود */
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",initAct);else initAct();
  /* دکمه‌ی انتخاب فایلِ فارسی: فقط برای فایل‌های دیدنی (نه فایل‌های مخفیِ ورود CSV و بازگردانی کاربران) */
  function initPick(){
    Array.prototype.forEach.call(document.querySelectorAll("input[type=file]"),function(inp){
      if(inp.offsetParent===null||inp.classList.contains("fp-in"))return;
      var wrap=document.createElement("div");wrap.className="fpick";
      var row=document.createElement("div");row.className="fp-row";
      var btn=document.createElement("button");btn.type="button";btn.className="btn alt";btn.textContent="انتخاب فایل";
      var nm=document.createElement("span");nm.className="fp-name";nm.setAttribute("dir","auto");
      row.appendChild(btn);row.appendChild(nm);
      inp.parentNode.insertBefore(wrap,inp);wrap.appendChild(row);wrap.appendChild(inp);
      inp.classList.add("fp-in");inp.tabIndex=-1;
      function sync(){
        var f=inp.files&&inp.files[0];
        nm.textContent=f?f.name:"فایلی انتخاب نشده";
        nm.className="fp-name"+(f?" has":"");
        btn.textContent=f?"تغییر فایل":"انتخاب فایل";
      }
      inp.__sync=sync;
      btn.addEventListener("click",function(){inp.click();});
      inp.addEventListener("change",sync);
      sync();
    });
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",initPick);else initPick();
  if(!window.history||!history.pushState||!window.MutationObserver||(!s&&!tb))return;
  var pushed=false;
  function anyOpen(){return !!((s&&s.classList.contains("more"))||(tb&&tb.classList.contains("open")));}
  function closeAll(){
    if(s)s.classList.remove("more");
    if(b)b.setAttribute("aria-expanded","false");
    if(tb)tb.classList.remove("open");
  }
  var chkT=null;
  function check(){
    chkT=null;
    var o=anyOpen();
    if(o&&!pushed){pushed=true;try{history.pushState({admOverlay:1},"");}catch(e){pushed=false;}}
    else if(!o&&pushed){pushed=false;try{history.back();}catch(e){}}
  }
  /* بررسی با تأخیر: وقتی از «بیشتر» روی «رنگ پنل» می‌زنیم، منو بسته و پنجره‌ی رنگ هم‌زمان باز می‌شود؛ باید یک ورودی تاریخچه برای هر دو بماند (قبلاً back() و push تداخل می‌کرد) */
  var mo=new MutationObserver(function(){if(chkT===null)chkT=setTimeout(check,0);});
  if(s)mo.observe(s,{attributes:true,attributeFilter:["class"]});
  if(tb)mo.observe(tb,{attributes:true,attributeFilter:["class"]});
  window.addEventListener("popstate",function(){
    if(anyOpen()){pushed=false;closeAll();}
  });
})();</script>
JS;
echo <<<'JS'
<script>(function(){try{var u=JSON.parse(localStorage.getItem("pdf_market_users_db")||"[]"),n=0;for(var i=0;i<u.length;i++)if(u[i]&&u[i].pendingAvatarImage)n++;var b=document.getElementById("navUsersBadge");if(b&&n){b.textContent=n>99?"99+":n.toLocaleString("fa-IR");b.hidden=false;}}catch(e){}})();</script>
JS;
$secNow = sec_read(SEC_FILE);
if (empty($secNow['pass_hash']) && in_array(ADMIN_PASSWORD, array('change-me-1234', 'admin123'), true)) echo '<div class="msg err">هشدار: هنوز رمز پیش‌فرض فعال است. از بخش <a href="admin.php?a=security">امنیت</a> رمز را عوض کن.</div>';
if ($flash) echo toast_flash_html($flash);

if ($action === 'featured') { featured_page(); layout_end(); exit; }
if ($action === 'books') { content_books_list(); layout_end(); exit; }
if ($action === 'book_edit') { content_book_edit(); layout_end(); exit; }

if ($action === 'home') {
    $nBooks = count(read_books()); $nNoPage = 0; $noPhoto = array();
    foreach ($authors as $x) {
        $sl = $x['slug'] ?? '';
        if ($sl === '') $nNoPage++;
        $p0 = !empty($x['photo']) ? $x['photo'] : ($sl ? find_photo($sl) : '');
        if (!$p0 || !file_exists(__DIR__ . '/' . $p0)) $noPhoto[] = $x;
    }
    // آخرین تغییرات: هر ذخیره، یک نسخه‌ی پشتیبان با زمان همان لحظه می‌سازد
    $recent = array();
    $bkFiles = glob(BACKUP_DIR . '/*.json');
    if ($bkFiles) {
        $items = array();
        foreach ($bkFiles as $f) {
            $ts = (int)@filemtime($f);
            if (preg_match('/-(\d{8})-(\d{6})\.json$/', basename($f), $m)) {
                $t2 = strtotime(substr($m[1], 0, 4) . '-' . substr($m[1], 4, 2) . '-' . substr($m[1], 6, 2) . ' ' . substr($m[2], 0, 2) . ':' . substr($m[2], 2, 2) . ':' . substr($m[2], 4, 2));
                if ($t2) $ts = $t2;
            }
            $items[] = array($ts, basename($f));
        }
        usort($items, function ($a, $b) { return $b[0] - $a[0]; });
        $recent = array_slice($items, 0, 6);
    }
    $kinds = array('authors' => 'نویسنده‌ها', 'books' => 'کتاب‌ها', 'genres' => 'ژانرها');

    page_head('داشبورد', 'خلاصه‌ی وضعیت فروشگاه و کارهای در انتظار');
    echo '<div class="qa"><a class="btn" href="admin.php?a=new">' . icon('plus') . 'نویسنده‌ی جدید</a>'
       . '<a class="btn alt" href="admin.php?a=users">' . icon('users') . 'بررسی عکس‌ها و پیام‌ها</a>'
       . '<a class="btn alt" href="index.html" target="_blank">' . icon('site') . 'مشاهده‌ی سایت</a></div>';
    echo '<div class="kpis">'
       . '<a class="kpi" href="admin.php?a=list"><b>' . count($authors) . '</b><span>نویسنده</span></a>'
       . '<a class="kpi" href="admin.php?a=books"><b>' . $nBooks . '</b><span>کتاب</span></a>'
       . '<a class="kpi" href="admin.php?a=users"><b id="dUsers">–</b><span>کاربر (روی این مرورگر)</span></a>'
       . '<a class="kpi" id="dPendCard" href="admin.php?a=users"><b id="dPend">–</b><span>عکس در انتظار تایید</span></a></div>';

    echo '<div class="two"><div class="card"><h1>کارهای در انتظار</h1>';
    echo '<h2>عکس‌های کاربران</h2><div id="dPendList"><p class="hint">در حال بررسی...</p></div>';
    echo '<h2>نویسنده‌ها</h2>';
    if (!$noPhoto && !$nNoPage) echo '<div class="okline">✅ همه‌ی نویسنده‌ها عکس و صفحه‌ی جدا دارند.</div>';
    foreach (array_slice($noPhoto, 0, 5) as $x) {
        echo '<div class="rw"><div class="grow"><b>' . e($x['name']['fa'] ?? '') . '</b> <small>— بدون عکس</small></div>'
           . '<a class="btn alt sm" href="admin.php?a=edit&id=' . urlencode($x['id'] ?? '') . '">افزودن عکس</a></div>';
    }
    if (count($noPhoto) > 5) echo '<p class="hint">و ' . (count($noPhoto) - 5) . ' نویسنده‌ی دیگر بدون عکس — <a href="admin.php?a=list">دیدن لیست</a></p>';
    if ($nNoPage) echo '<div class="rw"><div class="grow">' . $nNoPage . ' نویسنده فقط پنجره دارند (بدون صفحه‌ی جدا)</div><a class="btn alt sm" href="admin.php?a=list">بررسی</a></div>';
    echo '</div>';

    echo '<div class="card"><h1>آخرین تغییرات</h1><p class="hint">زمان آخرین ذخیره‌ها در نویسنده‌ها، کتاب‌ها و ژانرها (از نسخه‌های پشتیبان)</p>';
    if (!$recent) echo '<p class="hint">هنوز تغییری ثبت نشده است.</p>';
    foreach ($recent as $it) {
        $pre = explode('-', $it[1]);
        $lab = $kinds[$pre[0]] ?? $pre[0];
        echo '<div class="rw"><div class="grow">ذخیره‌ی ' . e($lab) . '</div><small class="js-ts" data-ts="' . (int)$it[0] . '"></small></div>';
    }
    echo '</div></div>';

    echo <<<'JS'
<script>(function(){
function esc(t){return String(t==null?"":t).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c];});}
var ts=document.querySelectorAll(".js-ts");for(var i=0;i<ts.length;i++){var v=Number(ts[i].getAttribute("data-ts"))*1000;if(v)ts[i].textContent=new Date(v).toLocaleString("fa-IR");}
var users=[];try{users=JSON.parse(localStorage.getItem("pdf_market_users_db")||"[]");}catch(e){}
if(!Array.isArray(users))users=[];
var pend=users.filter(function(u){return u&&u.pendingAvatarImage;});
document.getElementById("dUsers").textContent=users.length.toLocaleString("fa-IR");
document.getElementById("dPend").textContent=pend.length.toLocaleString("fa-IR");
if(pend.length)document.getElementById("dPendCard").className="kpi hot";
var box=document.getElementById("dPendList");
if(!pend.length){box.innerHTML='<div class="okline">✅ عکسی در انتظار بررسی نیست.</div>';return;}
box.innerHTML=pend.slice(0,4).map(function(u){return '<div class="rw"><div class="grow"><b>'+esc(u.username)+'</b> <small class="ltr" style="display:inline-block">'+esc(u.phone)+'</small></div><a class="btn sm" href="admin.php?a=users">بررسی</a></div>';}).join("")
 +(pend.length>4?'<p class="hint">و '+(pend.length-4).toLocaleString("fa-IR")+' مورد دیگر</p>':'');
})();</script>
JS;
    layout_end(); exit;
}

if ($action === 'users') {
    page_head('کاربران', 'بررسی عکس‌ها، جستجوی کاربر و ارسال پیام');
    echo '<div id="adminNotice" class="msg" style="display:none"></div>';
    echo '<div class="kpis" id="uKpis"></div>';

    echo '<div class="card"><h1>عکس‌های اختصاصی در انتظار تایید</h1>'
       . '<p class="hint">فقط برنده‌ی همین ماه می‌تواند عکس اختصاصی داشته باشد؛ عکس بقیه با «تایید» هم رد می‌شود. روی عکس بزنی بزرگ می‌شود. '
       . 'اطلاعات کاربران از مرورگر همین دستگاه خوانده می‌شود، پس کاربرانی را می‌بینی که روی همین مرورگر ثبت‌نام کرده‌اند.</p>'
       . '<div class="bulk" id="adminBulkBar" style="display:none"><label><input type="checkbox" id="adminPendAll"> انتخاب همه</label>'
       . '<button type="button" class="btn sm" id="adminBulkApprove">✅ تایید انتخاب‌شده‌ها</button>'
       . '<button type="button" class="btn danger sm" id="adminBulkReject">❌ رد انتخاب‌شده‌ها</button><span class="hint" id="adminBulkCount"></span></div>'
       . '<div id="adminPendingList"></div></div>'
       . '<div class="card"><h1>✍️ علایق نفر اول (در انتظار تایید)</h1><div id="adminInterestsList"></div></div>';

    echo '<div class="card"><h1>کاربران</h1>'
       . '<div class="ubar"><input type="text" id="adminUserSearch" autocomplete="off" placeholder="جستجو با شماره یا نام کاربری..."><span class="hint" id="adminUserCount"></span></div>'
       . '<div class="ubar" style="gap:8px;flex-wrap:wrap"><span class="hint">برای ارسال پیام فقط به چند نفر، کنار آن‌ها تیک بزن:</span><button type="button" class="btn alt sm" id="adminPickAll">✓ تیک همه‌ی نتایج جستجو</button><button type="button" class="btn alt sm" id="adminPickNone">پاک کردن تیک‌ها</button><span class="hint" id="adminPickCount"></span></div>'
       . '<div id="adminUserList"></div><p style="text-align:center;margin:12px 0 0"><button type="button" class="btn alt sm" id="adminUserMore" style="display:none">نمایش بیشتر</button></p></div>';

    echo '<div class="card" id="adminMsgCard"><h1>ارسال پیام یا پاسخ پرسش به کاربر</h1>'
       . '<label>قالب‌های آماده <span class="hint">— روی هرکدام بزنی عنوان و متن پر می‌شود؛ {نام} با نام کاربر جایگزین می‌شود</span></label><div class="chips" id="adminTplList"></div>'
       . '<label for="adminMsgTarget">گیرنده</label><select id="adminMsgTarget"><option value="single">یک کاربر (شماره یا نام کاربری)</option><option value="picked">کاربرانِ تیک‌خورده در لیست بالا (انتخاب دستی)</option><option value="filtered">همه‌ی کاربرانِ نتیجه‌ی جستجوی بالا (ارسال گروهی)</option><option value="all">همه‌ی کاربران (ارسال گروهی)</option></select>'
       . '<div class="sugg" id="adminMsgPhoneWrap"><label>شماره یا نام کاربری</label><input type="text" id="adminMsgPhone" autocomplete="off" placeholder="09121234567 یا نام کاربری"><div class="sugg-box" id="adminSuggBox" style="display:none"></div></div>'
       . '<label>عنوان <span class="hint">— اختیاری؛ اگر خالی باشد «پیام از مدیریت» نوشته می‌شود</span></label><input type="text" id="adminMsgTitle" autocomplete="off" placeholder="مثلاً: پاسخ به پرسش شما">'
       . '<label>متن پیام یا پاسخ</label><textarea id="adminMsgBody" rows="4"></textarea>'
       . '<p style="margin-top:14px;display:flex;gap:10px;flex-wrap:wrap"><button class="btn" type="button" id="adminSendBtn">ارسال به کادر «پیام از مدیریت»</button>'
       . '<input type="text" id="adminTplName" placeholder="نام قالب جدید" style="max-width:180px"><button class="btn alt" type="button" id="adminTplSave">ذخیره به‌عنوان قالب</button></p></div>';
    echo '<div class="lb" id="admLightbox"><div class="lb-in"><img id="admLbImg" alt=""><p id="admLbInfo" style="margin:10px 0 0"></p>'
       . '<div class="lb-acts"><button type="button" class="btn" id="admLbApprove">✅ تایید</button><button type="button" class="btn danger" id="admLbReject">❌ رد</button><button type="button" class="btn alt" id="admLbClose">بستن</button></div></div></div>';
    echo '<script src="admin-users.js?v=' . (int)@filemtime(__DIR__ . '/admin-users.js') . '"></script>';
    layout_end(); exit;
}

if ($action === 'bk_diff') {
    page_head('پیش‌نمایش بازگردانی', 'ببین با برگرداندن این نسخه چه چیزی عوض می‌شود');
    echo hist_diff_page_html(isset($_GET['f']) ? (string)$_GET['f'] : '');
    echo '<script>(function(){var ts=document.querySelectorAll(".js-ts");for(var i=0;i<ts.length;i++){var v=Number(ts[i].getAttribute("data-ts"))*1000;if(v)ts[i].textContent=new Date(v).toLocaleString("fa-IR");}})();</script>';
    layout_end(); exit;
}

if ($action === 'security') {
    $sec = sec_read(SEC_FILE);
    $totpOn = !empty($sec['totp_on']) && !empty($sec['totp_secret']);
    $pending = isset($_SESSION['totp_pending']) ? (string)$_SESSION['totp_pending'] : '';
    $baks = backup_list();
    $kinds = backup_kinds();
    $csrf = '<input type="hidden" name="csrf" value="' . e(csrf_token()) . '">';

    page_head('امنیت و پشتیبان', 'پشتیبان‌گیری، بازگردانی، تغییر رمز و تأیید دومرحله‌ای');
    echo '<div id="adminNotice" class="msg" style="display:none"></div>';

    // --- پشتیبان ---
    echo '<div class="card"><h1>پشتیبان‌گیری و بازگردانی</h1>'
       . '<p class="hint">با هر ذخیره‌ی نویسنده/کتاب/ژانر، یک نسخه‌ی قبلی خودکار نگه داشته می‌شود (۳۰ تای آخر هر نوع). از اینجا می‌توانی دانلودشان کنی یا برگردانی.</p>'
       . '</div>';
    if (class_exists('ZipArchive')) {
        $pinv = backup_pdf_inventory();
        echo '<div class="card"><h1>دانلود پشتیبان (zip)</h1>'
           . '<p class="hint">بخش‌هایی را که می‌خواهی در فایل پشتیبان باشد انتخاب کن. «همه‌ی بخش‌ها» یک پشتیبان کامل می‌سازد.</p>'
           . '<form method="get" action="admin.php"><input type="hidden" name="a" value="zip">'
           . '<label style="font-weight:400"><input type="checkbox" name="p[]" value="data" checked> اطلاعات سایت (نویسنده‌ها، کتاب‌ها، ژانرها، تنظیمات) — کم‌حجم</label><br>'
           . '<label style="font-weight:400"><input type="checkbox" name="p[]" value="photos" checked> عکس‌ها (نویسنده‌ها، کادر چهره‌ها و نسخه‌های اصلی عکس)</label><br>'
           . '<label style="font-weight:400"><input type="checkbox" name="p[]" value="pdfs" checked> فایل‌های PDF کتاب‌ها — ' . count($pinv['found']) . ' فایل، حدود ' . e(human_size($pinv['bytes'])) . '</label>'
           . ($pinv['missing'] ? '<p class="msg err" style="margin:10px 0 0">⚠️ ' . count($pinv['missing']) . ' فایل PDF در اطلاعات کتاب‌ها ثبت شده ولی روی دیسک پیدا نشد؛ در پشتیبان نخواهند بود.</p>' : '')
           . '<div class="btns" style="margin-top:12px"><button class="btn" type="submit">⬇️ دانلود پشتیبان انتخاب‌شده</button>'
           . '<a class="btn alt" href="admin.php?a=zip&p[]=data&p[]=photos&p[]=pdfs">⬇️ همه‌ی بخش‌ها (پشتیبان کامل)</a>'
           . '<a class="btn alt" href="admin.php?a=zip&p[]=pdfs">فقط PDFها</a>'
           . '<a class="btn alt" href="admin.php?a=zip&p[]=data&p[]=photos">بدون PDF (سبک)</a></div></form>'
           . '<p class="hint">حجم PDFها زیاد باشد، ساخت فایل ممکن است چند لحظه طول بکشد. داخل هر ZIP فایل BACKUP-INFO.txt هست که می‌گوید چه چیزی در آن است.</p>';
    } else {
        echo '<div class="card"><span class="hint">دانلود zip: افزونه‌ی zip در PHP فعال نیست.</span>';
    }
    echo '</div><div class="card"><h1>نسخه‌های خودکار</h1>';
    if (!$baks) echo '<p class="hint">هنوز نسخه‌ی پشتیبانی ساخته نشده؛ بعد از اولین ذخیره‌ی تغییرات ساخته می‌شود.</p>';
    foreach (array_slice($baks, 0, 15) as $b) {
        echo '<div class="rw"><div class="grow"><b>' . e($kinds[$b['kind']] ?? $b['kind']) . '</b> <small class="js-ts" data-ts="' . (int)$b['ts'] . '"></small>'
           . ' <small>· ' . max(1, (int)round($b['size'] / 1024)) . ' KB</small></div>'
           . '<a class="btn alt sm" href="admin.php?a=dl&f=' . urlencode($b['file']) . '">دانلود</a>'
           . '<a class="btn danger sm" href="admin.php?a=bk_diff&f=' . urlencode($b['file']) . '">پیش‌نمایش و بازگردانی</a></div>';
    }
    if (count($baks) > 15) echo '<p class="hint">و ' . (count($baks) - 15) . ' نسخه‌ی قدیمی‌تر که اینجا نشان داده نمی‌شود.</p>';
    echo '<h2>کاربران</h2><p class="hint">اطلاعات کاربران فقط داخل مرورگر است، پس خودت باید از آن‌ها فایل بگیری. این فایل شامل کاربران، برنده‌ی ماه و آمار حضور و مطالعه‌ی همین مرورگر است.</p>'
       . '<div class="btns"><button type="button" class="btn alt" id="usrBackup">⬇️ دانلود پشتیبان کاربران</button>'
       . '<button type="button" class="btn alt" id="usrRestoreBtn">⬆️ بازگردانی کاربران از فایل</button><input type="file" id="usrRestoreFile" accept="application/json,.json" style="display:none"></div></div>';

    // --- لاگ تغییرات ---
    echo '<div class="card"><h1>لاگ تغییرات</h1><p class="hint">هر ذخیره، حذف و بازگردانی با زمان و نوع عملیات اینجا ثبت می‌شود (۳۰ مورد آخر).</p>' . hist_log_html(30) . '</div>';

    // --- رمز ---
    echo '<div class="card"><h1>تغییر رمز</h1>';
    if (empty($sec['pass_hash'])) echo '<p class="hint">الان رمز از فایل admin-config.php خوانده می‌شود. بعد از تغییر از اینجا، رمز به‌صورت رمزنگاری‌شده در data ذخیره می‌شود و رمز آن فایل دیگر استفاده نمی‌شود.</p>';
    echo '<form method="post" action="admin.php?a=pass_change" autocomplete="off">' . $csrf
       . '<label>رمز فعلی</label><input type="password" name="cur" required autocomplete="current-password">'
       . '<div class="row"><div><label>رمز جدید <span class="hint">— حداقل ۸ کاراکتر</span></label><input type="password" name="new1" required minlength="8" autocomplete="new-password"></div>'
       . '<div><label>تکرار رمز جدید</label><input type="password" name="new2" required minlength="8" autocomplete="new-password"></div></div>'
       . '<div class="btns"><button class="btn" type="submit">ذخیره‌ی رمز جدید</button></div></form></div>';

    // --- 2FA ---
    echo '<div class="card"><h1>تأیید دومرحله‌ای' . ($totpOn ? ' <span class="tag ok">فعال</span>' : '') . '</h1>';
    if ($totpOn) {
        echo '<p class="hint">برای ورود، علاوه بر رمز، کد ۶ رقمی برنامه‌ی احراز هویت گوشی‌ات لازم است.</p>'
           . '<form method="post" action="admin.php?a=totp_disable" autocomplete="off">' . $csrf
           . '<div class="row"><div><label>رمز فعلی</label><input type="password" name="cur" required autocomplete="current-password"></div>'
           . '<div><label>کد ۶ رقمی فعلی</label><input type="text" name="code" class="ltr" inputmode="numeric" maxlength="8" autocomplete="one-time-code" required></div></div>'
           . '<div class="btns"><button class="btn danger" type="submit">غیرفعال‌کردن</button></div></form>'
           . '<div class="sec-note">اگر گوشی‌ات را گم کردی و نتوانستی وارد شوی: فایل <b class="ltr" style="display:inline-block">data/admin-security.php</b> را روی هاست پاک کن؛ تأیید دومرحله‌ای خاموش می‌شود و رمز به مقدار داخل admin-config.php برمی‌گردد.</div>';
    } elseif ($pending !== '') {
        $uri = 'otpauth://totp/' . rawurlencode('PDF Market Admin') . '?secret=' . $pending . '&issuer=' . rawurlencode('PDF Market');
        echo '<p>۱) در برنامه‌ی <b>Google Authenticator</b> یا Authy یا Microsoft Authenticator، گزینه‌ی «افزودن با کلید دستی / Enter a setup key» را بزن.<br>'
           . '۲) این کلید را وارد کن (نوع: مبتنی بر زمان):</p>'
           . '<div class="keybox">' . e(trim(chunk_split($pending, 4, ' '))) . '</div>'
           . '<p class="hint ltr" style="word-break:break-all">' . e($uri) . '</p>'
           . '<form method="post" action="admin.php?a=totp_enable" autocomplete="off">' . $csrf
           . '<label>۳) کد ۶ رقمی که برنامه نشان می‌دهد</label><input type="text" name="code" class="ltr" inputmode="numeric" maxlength="8" autocomplete="one-time-code" required style="max-width:220px">'
           . '<div class="btns"><button class="btn" type="submit">تأیید و فعال‌سازی</button></div></form>'
           . '<form method="post" action="admin.php?a=totp_cancel">' . $csrf . '<button class="btn alt sm" type="submit">انصراف</button></form>';
    } else {
        echo '<p class="hint">یک لایه‌ی امنیتی دوم: حتی اگر کسی رمزت را بداند، بدون گوشی‌ات نمی‌تواند وارد شود. ساعت سرور باید درست باشد.</p>'
           . '<form method="post" action="admin.php?a=totp_start">' . $csrf . '<div class="btns"><button class="btn" type="submit">شروع فعال‌سازی</button></div></form>';
    }
    echo '</div>';

    echo <<<'JS'
<script>(function(){
var ts=document.querySelectorAll(".js-ts");for(var i=0;i<ts.length;i++){var v=Number(ts[i].getAttribute("data-ts"))*1000;if(v)ts[i].textContent=new Date(v).toLocaleString("fa-IR");}
var KEYS=["pdf_market_users_db","pdf_market_champions","pdf_market_presence","pdf_market_pending_reading"];
function note(t,txt){if(window.admToast){window.admToast(t,txt);return;}var el=document.getElementById("adminNotice");el.className="msg "+t;el.textContent=txt;el.style.display="block";el.scrollIntoView({behavior:"smooth",block:"nearest"});}
document.getElementById("usrBackup").onclick=function(){
  try{
    var o={app:"pdf-market-users-backup",v:1,at:new Date().toISOString(),data:{}};
    KEYS.forEach(function(k){var v=localStorage.getItem(k);if(v!==null)o.data[k]=v;});
    var n=0;try{n=JSON.parse(o.data.pdf_market_users_db||"[]").length;}catch(e){}
    var a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(o)],{type:"application/json"}));
    a.download="pdf-market-users-"+new Date().toISOString().slice(0,10)+".json";document.body.appendChild(a);a.click();a.remove();
    note("ok","پشتیبان کاربران ساخته شد ("+n.toLocaleString("fa-IR")+" کاربر).");
  }catch(e){note("err","ساخت پشتیبان ممکن نشد.");}
};
var f=document.getElementById("usrRestoreFile");
document.getElementById("usrRestoreBtn").onclick=function(){f.click();};
f.onchange=function(){
  var file=f.files&&f.files[0];if(!file)return;
  var r=new FileReader();
  r.onload=function(){
    try{
      var o=JSON.parse(r.result);
      if(!o||o.app!=="pdf-market-users-backup"||!o.data||typeof o.data!=="object")throw 0;
      var keys=Object.keys(o.data).filter(function(k){return KEYS.indexOf(k)!==-1&&typeof o.data[k]==="string";});
      if(!keys.length)throw 0;
      keys.forEach(function(k){JSON.parse(o.data[k]);});
      var n=0;try{n=JSON.parse(o.data.pdf_market_users_db||"[]").length;}catch(e){}
      if(!confirm("اطلاعات کاربران این مرورگر با فایل جایگزین شود؟ ("+n.toLocaleString("fa-IR")+" کاربر)"))return;
      keys.forEach(function(k){localStorage.setItem(k,o.data[k]);});
      note("ok","کاربران بازگردانی شدند.");
    }catch(e){note("err","این فایل، پشتیبان معتبر کاربران نیست.");}
    f.value="";
  };
  r.readAsText(file);
};
})();</script>
JS;
    layout_end(); exit;
}

if ($action === 'new' || $action === 'edit') {
    $old = isset($_SESSION['old']) ? $_SESSION['old'] : null;
    unset($_SESSION['old']);
    $a = array(); $editId = '';
    if ($action === 'edit') {
        $editId = isset($_GET['id']) ? $_GET['id'] : '';
        foreach ($authors as $x) if (($x['id'] ?? '') === $editId) $a = $x;
        if (!$a) { echo '<div class="msg err">نویسنده پیدا نشد.</div>'; layout_end(); exit; }
    }
    // مقدار فیلد: اگر فرم قبلاً خطا داشت، از ورودی قبلی؛ وگرنه از اطلاعات ذخیره‌شده
    $v = function ($postKey, $stored = '') use ($old) {
        if ($old !== null) return isset($old[$postKey]) && is_string($old[$postKey]) ? $old[$postKey] : '';
        return $stored;
    };
    $g = function ($arr, $k1, $k2 = null) { // خواندن امن از آرایه‌ی تو در تو
        if (!isset($arr[$k1])) return '';
        if ($k2 === null) return is_scalar($arr[$k1]) ? (string)$arr[$k1] : '';
        return isset($arr[$k1][$k2]) && is_scalar($arr[$k1][$k2]) ? (string)$arr[$k1][$k2] : '';
    };
    $slugLocked = ($editId !== '' && !empty($a['slug']));
    $photoNow = $editId !== '' ? (!empty($a['photo']) ? $a['photo'] : find_photo($a['slug'] ?? '')) : '';

    page_head($editId === '' ? 'نویسنده‌ی جدید' : 'ویرایش: ' . e($g($a, 'name', 'fa')), $editId === '' ? 'اطلاعات نویسنده را پر کن؛ صفحه‌ی او خودکار ساخته می‌شود' : '', '<a class="btn alt" href="admin.php?a=list">بازگشت به لیست</a>');
    echo '<form method="post" action="admin.php?a=save" enctype="multipart/form-data" data-draft="author:' . e($editId === '' ? 'new' : $editId) . '"><div class="formcard">';
    echo '<input type="hidden" name="csrf" value="' . e(csrf_token()) . '"><input type="hidden" name="edit_id" value="' . e($editId) . '">';

    fs('آدرس صفحه', 'نشانی صفحه‌ی نویسنده در سایت و گوگل'); echo '<label>آدرس انگلیسی (slug) <span class="hint">— خودکار از نام انگلیسی ساخته می‌شود؛ در صورت نیاز می‌توانی دستی عوضش کنی</span></label>';
    echo '<input type="text" class="ltr" name="slug" id="authSlug" maxlength="60" placeholder="fyodor-dostoevsky" value="' . e($v('slug', $g($a, 'slug'))) . '"' . ($slugLocked ? ' readonly' : ' onblur="this.value=this.value.toLowerCase().trim()"') . '>';
    echo '<p class="hint">' . ($slugLocked ? 'برای حفظ سئو، آدرس بعد از ساخت قابل تغییر نیست.' : 'آدرس صفحه می‌شود: author-<b id="authSlugPrev">slug</b>.html') . '</p>';
    if (!$slugLocked) echo '<script>(function(){var s=document.getElementById("authSlug"),n=document.querySelector("input[name=name_en]"),p=document.getElementById("authSlugPrev");if(!s||!n)return;var manual=s.value!=="";function c(x){return x.toLowerCase().replace(/[\x27\u2018\u2019]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,60).replace(/-+$/,"");}function u(){if(p)p.textContent=s.value||"slug";}n.addEventListener("input",function(){if(!manual){s.value=c(n.value);u();}});s.addEventListener("input",function(){manual=s.value!=="";u();});u();})();</script>';

    fs('نام'); echo '<div class="row"><div><label>نام فارسی</label><input type="text" name="name_fa" required value="' . e($v('name_fa', $g($a, 'name', 'fa'))) . '"></div>'
       . '<div><label>نام انگلیسی</label><input type="text" class="ltr" name="name_en" required value="' . e($v('name_en', $g($a, 'name', 'en'))) . '"></div></div>';

    // ----- single-book author -----
    $bk = array();
    if ($editId !== '') foreach (read_books() as $bb) if (($bb['authorId'] ?? '') === $editId) { $bk = $bb; break; }
    $isSingle = ($old !== null) ? (isset($old['single']) && $old['single'] === '1') : !empty($a['singleBook']);
    $curBG = $v('b_genre_choice', $g($bk, 'genreGroup'));
    $curCat = $v('b_category', $g($bk, 'category') !== '' ? $g($bk, 'category') : 'fiction');
    fs('نوع نویسنده', 'اگر فقط یک کتاب دارد، کتابش را همین‌جا ثبت کن'); echo '<label style="font-weight:400"><input type="checkbox" id="singleChk" name="single" value="1"' . ($isSingle ? ' checked' : '') . '> '
       . 'این نویسنده فقط <b>یک کتاب</b> دارد (کتاب و ژانرش را همین‌جا ثبت کن)</label>';
    echo '<div id="singleBox" style="display:none;border:1px dashed var(--b);border-radius:12px;padding:6px 14px 14px;margin-top:10px">';
    echo '<h2>اطلاعات کتاب</h2><div class="row"><div><label>نام کتاب (فارسی)</label><input type="text" name="b_title_fa" value="' . e($v('b_title_fa', $g($bk, 'title', 'fa'))) . '"></div>'
       . '<div><label>نام کتاب (انگلیسی)</label><input type="text" class="ltr" name="b_title_en" value="' . e($v('b_title_en', $g($bk, 'title', 'en'))) . '"></div></div>';
    echo '<label>ژانر کتاب <span class="hint">— یکی از ژانرهای موجود را انتخاب کن، یا «ژانر جدید» را بزن و خودت بنویس تا به دسته‌ی ژانرهای سایت هم اضافه شود</span></label><select name="b_genre_choice" id="genreSel"><option value="">انتخاب کن...</option>';
    foreach ($GENRE_GROUPS as $gk => $label) echo '<option value="' . e($gk) . '"' . ($curBG === $gk ? ' selected' : '') . '>' . e($label) . '</option>';
    echo '<option value="__new"' . ($curBG === '__new' ? ' selected' : '') . '>➕ ژانر جدید (خودم می‌نویسم)</option></select>';
    echo '<div id="newGenreBox" style="display:none"><div class="row"><div><label>نام ژانر جدید (فارسی)</label><input type="text" name="b_newgenre_fa" value="' . e($v('b_newgenre_fa')) . '" placeholder="مثلاً: ادبیات جنایی"></div>'
       . '<div><label>نام ژانر جدید (انگلیسی) <span class="hint">— لازم</span></label><input type="text" class="ltr" name="b_newgenre_en" value="' . e($v('b_newgenre_en')) . '" placeholder="Crime Fiction"></div></div></div>';
    $cats = array('fiction' => 'رمان و داستان', 'literature' => 'ادبیات', 'philosophy' => 'فلسفه', 'psychology' => 'روان‌شناسی', 'success' => 'موفقیت و خودیاری');
    echo '<label>دسته‌ی کتاب</label><select name="b_category">';
    foreach ($cats as $ck => $cl) echo '<option value="' . e($ck) . '"' . ($curCat === $ck ? ' selected' : '') . '>' . e($cl) . '</option>';
    echo '</select>';
    echo '<div class="row"><div><label>قیمت (تومان)</label><input type="text" name="b_price" inputmode="numeric" value="' . e($v('b_price', $g($bk, 'totalPrice'))) . '"></div>'
       . '<div><label>تعداد صفحه</label><input type="text" name="b_pages" inputmode="numeric" value="' . e($v('b_pages', $g($bk, 'pages'))) . '"></div></div>';
    echo '<div class="row"><div><label>ناشر (فارسی)</label><input type="text" name="b_publisher_fa" value="' . e($v('b_publisher_fa', $g($bk, 'publisher', 'fa'))) . '"></div>'
       . '<div><label>ناشر (انگلیسی)</label><input type="text" class="ltr" name="b_publisher_en" value="' . e($v('b_publisher_en', $g($bk, 'publisher', 'en'))) . '"></div></div>';
    echo '<div class="row"><div><label>مترجم (فارسی)</label><input type="text" name="b_translator_fa" value="' . e($v('b_translator_fa', $g($bk, 'translator', 'fa'))) . '"></div>'
       . '<div><label>مترجم (انگلیسی)</label><input type="text" class="ltr" name="b_translator_en" value="' . e($v('b_translator_en', $g($bk, 'translator', 'en'))) . '"></div></div>';
    echo '<label>توضیح کتاب (فارسی)</label><textarea name="b_desc_fa" style="min-height:80px">' . e($v('b_desc_fa', $g($bk, 'desc', 'fa'))) . '</textarea>';
    echo '<label>توضیح کتاب (انگلیسی) <span class="hint">— اختیاری</span></label><textarea class="ltr" name="b_desc_en" style="min-height:80px">' . e($v('b_desc_en', $g($bk, 'desc', 'en'))) . '</textarea>';
    echo pdf_field_html($bk, $g($bk, 'id'));
    echo '</div>';

    fs('عکس', 'عمودی و با نسبت ۳ به ۴ بهتر دیده می‌شود');
    if ($photoNow) echo '<p><img class="thumb" src="' . e($photoNow) . '?v=' . time() . '" alt=""> <span class="hint">عکس فعلی. برای تعویض، عکس جدید انتخاب کن.</span></p>';
    echo '<input type="file" name="photo" accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"><input type="hidden" name="photo_orig_token" value=""><input type="hidden" name="photo_client_opt" value=""><div class="chunk-prog" data-for="photo"><div class="cp-bar"><i></i></div><span class="cp-tx"></span></div><p class="hint">JPG / PNG / WEBP، حداکثر ۲۵ مگابایت (خودکار کوچک و بهینه می‌شود؛ نسخه‌ی اصلی نگه داشته می‌شود). پیشنهاد: عکس عمودی با نسبت تقریبی ۳ به ۴.' . (extension_loaded('gd') ? '' : ' <b>GD روی این سرور خاموش است؛ اشکالی ندارد، کوچک‌سازی را مرورگر خودت انجام می‌دهد.</b>') . '</p>';
    echo '<label>ایموجی جایگزین <span class="hint">— وقتی عکس نیست نشان داده می‌شود</span></label><input type="text" name="emoji" style="max-width:120px" value="' . e($v('emoji', $g($a, 'avatarEmoji'))) . '" placeholder="📖">';
    $inFaces = ($old !== null) ? (isset($old['in_faces']) && $old['in_faces'] === '1') : ($editId !== '' && featured_has($editId));
    echo '<input type="hidden" name="faces_present" value="1">';
    echo '<label style="font-weight:400;margin-top:14px"><input type="checkbox" name="in_faces" value="1"' . ($inFaces ? ' checked' : '') . '> '
       . 'عکس این نویسنده در <b>کادر چهره‌ها</b> (صفحه‌ی اصلی) هم نمایش داده شود</label>'
       . '<p class="hint">عکس و اسم خودکار از همین نویسنده گرفته می‌شود و با کلیک روی آن، صفحه‌ی اختصاصی‌اش باز می‌شود. اگر عکس نگذاری، ایموجی نمایش داده می‌شود.</p>';

    fs('مشخصات'); echo '<div class="row"><div><label>سال تولد</label><input type="text" name="birthYear" required value="' . e($v('birthYear', $g($a, 'birthYear'))) . '"></div>'
       . '<div><label>سال وفات <span class="hint">— اگر زنده است خالی بگذار</span></label><input type="text" name="deathYear" value="' . e($v('deathYear', $g($a, 'deathYear'))) . '"></div></div>';
    echo '<div class="row"><div><label>ملیت (فارسی) <span class="hint">— لازم</span></label><input type="text" name="nat_fa" required value="' . e($v('nat_fa', $g($a, 'nationality', 'fa'))) . '"></div>'
       . '<div><label>ملیت (انگلیسی) <span class="hint">— لازم</span></label><input type="text" class="ltr" name="nat_en" required value="' . e($v('nat_en', $g($a, 'nationality', 'en'))) . '"></div></div>';
    $curGroup = $v('genreGroup', $g($a, 'genreGroup'));
    echo '<div id="authorGenreBox"><label>گروه ژانر <span class="hint">— برای فیلتر کتاب‌ها</span></label><select name="genreGroup"><option value="">انتخاب کن...</option>';
    foreach ($GENRE_GROUPS as $k => $label) echo '<option value="' . e($k) . '"' . ($curGroup === $k ? ' selected' : '') . '>' . e($label) . '</option>';
    echo '</select>';
    echo '<div class="row"><div><label>سبک و ژانر (فارسی) <span class="hint">— لازم</span></label><input type="text" name="genre_fa" value="' . e($v('genre_fa', $g($a, 'genre', 'fa'))) . '"></div>'
       . '<div><label>سبک و ژانر (انگلیسی) <span class="hint">— لازم</span></label><input type="text" class="ltr" name="genre_en" value="' . e($v('genre_en', $g($a, 'genre', 'en'))) . '"></div></div></div>';

    fs('بیوگرافی'); echo '<label>بیوگرافی (فارسی) <span class="hint">— لازم؛ باید فارسی باشد</span></label><textarea name="bio_fa" required>' . e($v('bio_fa', $g($a, 'bio', 'fa'))) . '</textarea>';
    echo '<label>بیوگرافی (انگلیسی) <span class="hint">— لازم؛ فقط انگلیسی (برای نسخه‌ی انگلیسی سایت و گوگل)</span></label><textarea class="ltr" name="bio_en" required>' . e($v('bio_en', $g($a, 'bio', 'en'))) . '</textarea>';

    fs('اختیاری', 'پر کردنشان لازم نیست'); echo '<div class="row"><div><label>افتخارات (فارسی)</label><textarea name="awards_fa" style="min-height:70px">' . e($v('awards_fa', $g($a, 'awards', 'fa'))) . '</textarea></div>'
       . '<div><label>افتخارات (انگلیسی)</label><textarea class="ltr" name="awards_en" style="min-height:70px">' . e($v('awards_en', $g($a, 'awards', 'en'))) . '</textarea></div></div>';
    echo '<div class="row"><div><label>جمله‌ی معروف (فارسی)</label><input type="text" name="quote_fa" value="' . e($v('quote_fa', $g($a, 'quote', 'fa'))) . '"></div>'
       . '<div><label>جمله‌ی معروف (انگلیسی)</label><input type="text" class="ltr" name="quote_en" value="' . e($v('quote_en', $g($a, 'quote', 'en'))) . '"></div></div>';
    echo '<div class="row"><div><label>توضیح متا برای گوگل (فارسی) <span class="hint">— اختیاری؛ حدود ۱۵۰ کاراکتر. اگر خالی باشد، خودکار ساخته می‌شود</span></label><input type="text" name="meta_fa" value="' . e($v('meta_fa', $g($a, 'metaDescription', 'fa'))) . '"></div>'
       . '<div><label>توضیح متا برای گوگل (انگلیسی) <span class="hint">— اختیاری؛ حدود ۱۵۰ کاراکتر. اگر خالی باشد، خودکار ساخته می‌شود</span></label><input type="text" class="ltr" name="meta_en" value="' . e($v('meta_en', $g($a, 'metaDescription', 'en'))) . '"></div></div>';

    fs_end();
    echo '</div><div class="actions"><button class="btn" type="submit">ذخیره</button><a class="btn alt" href="admin.php?a=list">انصراف</a></div></form>';
    echo '<script>(function(){var c=document.getElementById("singleChk"),b=document.getElementById("singleBox"),ag=document.getElementById("authorGenreBox"),s=document.getElementById("genreSel"),n=document.getElementById("newGenreBox");'
       . 'function u(){b.style.display=c.checked?"block":"none";ag.style.display=c.checked?"none":"block";n.style.display=(c.checked&&s.value==="__new")?"block":"none";}'
       . 'c.addEventListener("change",u);s.addEventListener("change",u);u();})();</script>';
    layout_end(); exit;
}

// لیست نویسنده‌ها (جستجو، فیلتر، مرتب‌سازی و صفحه‌بندی در admin-content.php)
content_authors_list($authors);
layout_end();
