<?php
// ============================================================
// بازیابی رمز عبور با کد پیامکی (سمت سرور)
//
// چرا سمت سرور؟ رمز کاربرها داخل Supabase Auth است و فقط با «کلید سرویس»
// (service_role) می‌شود عوضش کرد؛ آن کلید هرگز نباید داخل مرورگر برود.
// کد تأیید (OTP) هم همین‌جا ساخته و چک می‌شود، نه در مرورگر؛ وگرنه هر کسی
// می‌توانست بدون کد، رمز دیگران را عوض کند.
//
// دو عملیات (POST و JSON):
//   {"action":"send","phone":"09..."}                      -> ساخت و ارسال کد
//   {"action":"reset","phone":"09...","otp":"1234","password":"123456"} -> چک کد + تغییر رمز
// ============================================================
require_once __DIR__ . '/reset-config.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function out($code, $arr) { http_response_code($code); echo json_encode($arr, JSON_UNESCAPED_UNICODE); exit; }

if ($_SERVER['REQUEST_METHOD'] !== 'POST') out(405, array('ok' => false, 'error' => 'method'));
if (SUPABASE_SERVICE_KEY === '' || strpos(SUPABASE_SERVICE_KEY, 'PUT_') === 0) {
    out(500, array('ok' => false, 'error' => 'not_configured'));
}

$in = json_decode(file_get_contents('php://input'), true);
if (!is_array($in)) out(400, array('ok' => false, 'error' => 'bad_request'));
$action = isset($in['action']) ? $in['action'] : '';
$phone  = isset($in['phone']) ? preg_replace('/\D/', '', (string)$in['phone']) : '';
if (!preg_match('/^09[0-9]{9}$/', $phone)) out(400, array('ok' => false, 'error' => 'bad_phone'));

// ---------- ذخیره‌ی کد (فایل داخل data/otp؛ فایل‌های .json از بیرون بسته‌اند) ----------
$dir = __DIR__ . '/data/otp';
if (!is_dir($dir)) @mkdir($dir, 0700, true);
$file = $dir . '/' . hash('sha256', $phone) . '.json';

function load_rec($file) {
    if (!file_exists($file)) return null;
    $r = json_decode(@file_get_contents($file), true);
    return is_array($r) ? $r : null;
}
function save_rec($file, $r) { file_put_contents($file, json_encode($r), LOCK_EX); }

// ---------- ارتباط با Supabase با کلید سرویس ----------
function supa($method, $path, $body = null) {
    $ch = curl_init(rtrim(SUPABASE_URL, '/') . $path);
    $headers = array(
        'apikey: ' . SUPABASE_SERVICE_KEY,
        'Authorization: Bearer ' . SUPABASE_SERVICE_KEY,
        'Content-Type: application/json',
    );
    curl_setopt_array($ch, array(
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 15,
    ));
    if ($body !== null) curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
    $res = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return array($code, json_decode((string)$res, true));
}

// شناسه‌ی کاربر در Supabase Auth از روی شماره؛ null یعنی چنین حسابی نیست
function find_auth_user_id($phone) {
    list($c, $rows) = supa('GET', '/rest/v1/users?select=auth_user_id&phone=eq.' . rawurlencode($phone) . '&limit=1');
    if ($c === 200 && is_array($rows) && count($rows) && !empty($rows[0]['auth_user_id'])) return $rows[0]['auth_user_id'];
    // پروفایل ناقص/بدون لینک: داخل لیست کاربران Auth دنبال ایمیل داخلی می‌گردیم
    $email = $phone . '@users.pdfmarket.internal';
    for ($page = 1; $page <= 20; $page++) {
        list($c, $res) = supa('GET', '/auth/v1/admin/users?page=' . $page . '&per_page=200');
        if ($c !== 200 || empty($res['users'])) break;
        foreach ($res['users'] as $u) if (isset($u['email']) && strtolower($u['email']) === $email) return $u['id'];
        if (count($res['users']) < 200) break;
    }
    return null;
}

$now = time();

if ($action === 'send') {
    $rec = load_rec($file);
    if ($rec && isset($rec['sent']) && $now - $rec['sent'] < OTP_RESEND_SECONDS) {
        out(429, array('ok' => false, 'error' => 'too_soon', 'wait' => OTP_RESEND_SECONDS - ($now - $rec['sent'])));
    }
    $uid = find_auth_user_id($phone);
    if (!$uid) out(404, array('ok' => false, 'error' => 'no_account'));

    $otp = (string)random_int(1000, 9999);
    save_rec($file, array('hash' => hash_hmac('sha256', $otp, OTP_SECRET . $phone), 'exp' => $now + OTP_TTL_SECONDS, 'sent' => $now, 'tries' => 0));

    $resp = array('ok' => true);
    if (SMS_TEST_MODE) {
        $resp['test_otp'] = $otp;   // فقط حالت تست: کد در پاسخ برمی‌گردد تا روی صفحه نمایش داده شود
    } else {
        // TODO: اتصال به پنل پیامک. وقتی پنل وصل شد، همین تابع را کامل کن و SMS_TEST_MODE را false بگذار.
        if (function_exists('send_sms')) send_sms($phone, 'کد بازیابی رمز عبور: ' . $otp);
    }
    out(200, $resp);
}

if ($action === 'reset') {
    $otp = isset($in['otp']) ? preg_replace('/\D/', '', (string)$in['otp']) : '';
    $pw  = isset($in['password']) ? (string)$in['password'] : '';
    if (!preg_match('/^[0-9]{6,}$/', $pw)) out(400, array('ok' => false, 'error' => 'bad_password'));

    $rec = load_rec($file);
    if (!$rec || $now > $rec['exp']) out(400, array('ok' => false, 'error' => 'expired'));
    if ($rec['tries'] >= OTP_MAX_TRIES) { @unlink($file); out(429, array('ok' => false, 'error' => 'too_many_tries')); }

    $rec['tries']++;
    save_rec($file, $rec);
    if (!hash_equals($rec['hash'], hash_hmac('sha256', $otp, OTP_SECRET . $phone))) {
        out(400, array('ok' => false, 'error' => 'wrong_code'));
    }

    $uid = find_auth_user_id($phone);
    if (!$uid) out(404, array('ok' => false, 'error' => 'no_account'));
    list($c, $res) = supa('PUT', '/auth/v1/admin/users/' . rawurlencode($uid), array('password' => $pw));
    if ($c < 200 || $c >= 300) {
        $msg = is_array($res) && isset($res['msg']) ? $res['msg'] : (isset($res['message']) ? $res['message'] : '');
        out(502, array('ok' => false, 'error' => 'supabase', 'detail' => $msg));
    }
    @unlink($file); // کد فقط یک‌بار قابل استفاده است
    out(200, array('ok' => true));
}

out(400, array('ok' => false, 'error' => 'bad_action'));
