<?php
// ============================================================
// بخش ۶ پنل ادمین: لاگ تغییرات و پیش‌نمایش تفاوت نسخه‌ی پشتیبان
//   • هر ذخیره‌ی نویسنده/کتاب/ژانر خودکار در data/changelog.json ثبت می‌شود
//     (زمان، نوع عملیات: افزودن / ویرایش / حذف / بازگردانی / ورود CSV، و اسم موردها)
//   • قبل از بازگردانی یک نسخه‌ی پشتیبان، تفاوتش با فایل فعلی نشان داده می‌شود
// فقط از admin.php لود می‌شود.
// ============================================================
if (!function_exists('csrf_token')) { http_response_code(404); exit; }

const CHANGELOG_FILE = __DIR__ . '/data/changelog.json';
const CHANGELOG_MAX  = 300;

// ---------- مقایسه‌ی دو نسخه از یک فایل JSON ----------

// هر مورد یا با id شناخته می‌شود (نویسنده/کتاب) یا با کلید خودش (ژانرها)
function hist_index($data) {
    $out = array();
    if (!is_array($data)) return $out;
    foreach ($data as $k => $item) {
        $has = is_array($item) && isset($item['id']) && is_scalar($item['id']) && (string)$item['id'] !== '';
        $out[($has ? 'id:' . $item['id'] : 'k:' . $k)] = $item;
    }
    return $out;
}

function hist_label($item, $fallback) {
    if (!is_array($item)) return (string)$fallback;
    $c = array();
    if (isset($item['name']) && is_array($item['name']) && isset($item['name']['fa'])) $c[] = $item['name']['fa'];
    if (isset($item['title']) && is_array($item['title']) && isset($item['title']['fa'])) $c[] = $item['title']['fa'];
    if (isset($item['fa']) && is_string($item['fa'])) $c[] = $item['fa'];
    if (isset($item['id'])) $c[] = $item['id'];
    foreach ($c as $x) {
        if (is_scalar($x) && trim((string)$x) !== '') return (string)$x;
    }
    return (string)$fallback;
}

// فیلدهایی که بین دو مورد فرق دارند: نام فیلد => [مقدار قبلی، مقدار جدید]
function hist_changed_fields($a, $b) {
    $out = array();
    if (!is_array($a) || !is_array($b)) {
        if (json_encode($a) !== json_encode($b)) $out['*'] = array($a, $b);
        return $out;
    }
    $keys = array_unique(array_merge(array_keys($a), array_keys($b)));
    foreach ($keys as $k) {
        $x = array_key_exists($k, $a) ? $a[$k] : null;
        $y = array_key_exists($k, $b) ? $b[$k] : null;
        if (json_encode($x) !== json_encode($y)) $out[(string)$k] = array($x, $y);
    }
    return $out;
}

// تفاوت $old تا $new:  added = فقط در جدید | removed = فقط در قدیم | changed = در هر دو ولی فرق دارد
function hist_compare($old, $new) {
    $o = hist_index($old);
    $n = hist_index($new);
    $res = array('added' => array(), 'removed' => array(), 'changed' => array());
    foreach ($n as $k => $item) {
        if (!array_key_exists($k, $o)) {
            $res['added'][] = array('label' => hist_label($item, $k));
        } else {
            $f = hist_changed_fields($o[$k], $item);
            if ($f) $res['changed'][] = array('label' => hist_label($item, $k), 'fields' => array_keys($f), 'diff' => $f);
        }
    }
    foreach ($o as $k => $item) {
        if (!array_key_exists($k, $n)) $res['removed'][] = array('label' => hist_label($item, $k));
    }
    return $res;
}

function hist_read_file($path) {
    if (!is_file($path)) return null;
    $raw = (string)@file_get_contents($path);
    if (substr($raw, 0, 3) === "\xEF\xBB\xBF") $raw = substr($raw, 3);
    $d = json_decode($raw, true);
    return is_array($d) ? $d : null;
}

// ---------- ثبت در لاگ ----------

function hist_append($entry) {
    $list = array();
    if (is_file(CHANGELOG_FILE)) {
        $d = json_decode((string)@file_get_contents(CHANGELOG_FILE), true);
        if (is_array($d)) $list = $d;
    }
    array_unshift($list, $entry);
    if (count($list) > CHANGELOG_MAX) $list = array_slice($list, 0, CHANGELOG_MAX);
    @file_put_contents(CHANGELOG_FILE, json_encode($list, JSON_UNESCAPED_UNICODE), LOCK_EX);
}

// بعد از هر ذخیره‌ی موفق صدا زده می‌شود. هیچ‌وقت نباید جلوی ذخیره‌ی اصلی را بگیرد.
// نوع عملیات خودکار از تفاوت قبل و بعد تشخیص داده می‌شود؛ بازگردانی و ورود CSV با $GLOBALS['HIST_OP'] مشخص می‌شوند.
function log_change($kind, $old, $new) {
    try {
        $cmp = hist_compare($old, $new);
        $na = count($cmp['added']); $nr = count($cmp['removed']); $nc = count($cmp['changed']);
        if (!$na && !$nr && !$nc) return;
        $op = isset($GLOBALS['HIST_OP']) ? (string)$GLOBALS['HIST_OP'] : '';
        if ($op === '') {
            if ($na && !$nr && !$nc) $op = 'add';
            elseif ($nr && !$na && !$nc) $op = 'delete';
            elseif ($nc && !$na && !$nr) $op = 'edit';
            else $op = 'mixed';
        }
        $items = array();
        foreach (array('added', 'removed', 'changed') as $g) {
            foreach ($cmp[$g] as $x) { $items[] = $x['label']; if (count($items) >= 4) break 2; }
        }
        hist_append(array('ts' => time(), 'kind' => (string)$kind, 'op' => $op, 'added' => $na, 'removed' => $nr, 'changed' => $nc, 'items' => $items));
    } catch (Throwable $ex) {
        // لاگ ناموفق نباید ذخیره‌ی اصلی را خراب کند
    }
}

// رویدادهای غیرمربوط به فایل‌های داده (تغییر رمز، دومرحله‌ای). هیچ رمز یا کدی ثبت نمی‌شود.
function hist_event($op, $text) {
    try {
        hist_append(array('ts' => time(), 'kind' => 'security', 'op' => (string)$op, 'added' => 0, 'removed' => 0, 'changed' => 0, 'items' => array((string)$text)));
    } catch (Throwable $ex) {
    }
}

// ---------- نمایش ----------

function hist_op_info($op) {
    $map = array(
        'add'         => array('افزودن', 'ok'),
        'edit'        => array('ویرایش', ''),
        'delete'      => array('حذف', 'no'),
        'restore'     => array('بازگردانی پشتیبان', 'hot'),
        'import'      => array('ورود از CSV', ''),
        'mixed'       => array('تغییر چندگانه', ''),
        'pass_change' => array('تغییر رمز', 'hot'),
        'totp_on'     => array('فعال‌سازی دومرحله‌ای', 'ok'),
        'totp_off'    => array('غیرفعال‌سازی دومرحله‌ای', 'no'),
    );
    return isset($map[$op]) ? $map[$op] : array((string)$op, '');
}

function hist_kind_label($kind) {
    $k = function_exists('backup_kinds') ? backup_kinds() : array();
    if ($kind === 'security') return 'امنیت';
    return isset($k[$kind]) ? $k[$kind] : (string)$kind;
}

function hist_log_html($limit) {
    $list = array();
    if (is_file(CHANGELOG_FILE)) {
        $d = json_decode((string)@file_get_contents(CHANGELOG_FILE), true);
        if (is_array($d)) $list = $d;
    }
    if (!$list) return '<p class="hint">هنوز تغییری ثبت نشده؛ از این به بعد هر ذخیره، حذف و بازگردانی اینجا می‌آید.</p>';
    $html = '';
    foreach (array_slice($list, 0, (int)$limit) as $x) {
        if (!is_array($x)) continue;
        $info = hist_op_info(isset($x['op']) ? $x['op'] : '');
        $parts = array();
        if (!empty($x['added']))   $parts[] = (int)$x['added'] . ' مورد اضافه';
        if (!empty($x['removed'])) $parts[] = (int)$x['removed'] . ' مورد حذف';
        if (!empty($x['changed'])) $parts[] = (int)$x['changed'] . ' مورد ویرایش';
        $names = (isset($x['items']) && is_array($x['items'])) ? array_map('strval', array_slice($x['items'], 0, 4)) : array();
        $more = (int)(isset($x['added']) ? $x['added'] : 0) + (int)(isset($x['removed']) ? $x['removed'] : 0) + (int)(isset($x['changed']) ? $x['changed'] : 0) - count($names);
        $line = implode(' · ', $parts);
        if ($names) $line .= ($line !== '' ? ' — ' : '') . implode('، ', $names) . ($more > 0 ? ' و ' . $more . ' مورد دیگر' : '');
        $html .= '<div class="rw"><div class="grow"><span class="tag ' . e($info[1]) . '">' . e($info[0]) . '</span> <b>' . e(hist_kind_label(isset($x['kind']) ? $x['kind'] : '')) . '</b> '
              . '<small class="js-ts" data-ts="' . (int)(isset($x['ts']) ? $x['ts'] : 0) . '"></small>'
              . ($line !== '' ? '<div><small>' . e($line) . '</small></div>' : '') . '</div></div>';
    }
    return $html;
}

function hist_short($v) {
    if (is_array($v)) $v = json_encode($v, JSON_UNESCAPED_UNICODE);
    elseif ($v === null) $v = '—';
    elseif (is_bool($v)) $v = $v ? 'true' : 'false';
    $v = (string)$v;
    if (function_exists('mb_strlen')) {
        if (mb_strlen($v, 'UTF-8') > 60) return mb_substr($v, 0, 60, 'UTF-8') . '…';
        return $v;
    }
    return strlen($v) > 120 ? substr($v, 0, 120) . '…' : $v;
}

function hist_current_path($kind) {
    if ($kind === 'authors') return AUTHORS_FILE;
    if ($kind === 'books') return BOOKS_FILE;
    if ($kind === 'genres') return GENRES_FILE;
    return null;
}

// صفحه‌ی «پیش‌نمایش بازگردانی»: نشان می‌دهد با بازگردانی این نسخه چه چیزهایی برمی‌گردد، حذف می‌شود یا عوض می‌شود
function hist_diff_page_html($file) {
    $p = backup_path($file);
    if (!$p) return '<div class="card"><h1>نسخه‌ی پشتیبان پیدا نشد</h1><p><a class="btn alt" href="admin.php?a=security">بازگشت</a></p></div>';
    $kind = explode('-', basename($p));
    $kind = $kind[0];
    $backup = hist_read_file($p);
    if ($backup === null) return '<div class="card"><h1>این فایل پشتیبان خراب است</h1><p class="hint">قابل بازگردانی نیست.</p><p><a class="btn alt" href="admin.php?a=security">بازگشت</a></p></div>';
    $cur = hist_read_file(hist_current_path($kind));
    $cmp = hist_compare($cur === null ? array() : $cur, $backup);   // قدیم = فایل فعلی، جدید = نسخه‌ی پشتیبان
    $kinds = backup_kinds();
    $ts = 0;
    if (preg_match('/-(\d{4})(\d{2})(\d{2})-(\d{2})(\d{2})(\d{2})\.json$/', basename($p), $m)) {
        $ts = (int)strtotime($m[1] . '-' . $m[2] . '-' . $m[3] . ' ' . $m[4] . ':' . $m[5] . ':' . $m[6]);
    }
    $na = count($cmp['added']); $nr = count($cmp['removed']); $nc = count($cmp['changed']);

    $h = '<div class="card"><h1>پیش‌نمایش بازگردانی — ' . e(isset($kinds[$kind]) ? $kinds[$kind] : $kind) . ' <small class="js-ts" data-ts="' . $ts . '"></small></h1>';
    if (!$na && !$nr && !$nc) {
        $h .= '<div class="okline">✅ این نسخه با فایل فعلی دقیقاً یکی است؛ بازگردانی چیزی را عوض نمی‌کند.</div>';
    } else {
        $h .= '<p class="hint">اگر این نسخه را برگردانی، فایل فعلی جایگزین می‌شود (از فایل فعلی هم پشتیبان گرفته می‌شود). نتیجه:</p>'
           . '<div class="kpis"><div class="kpi"><b>' . $na . '</b><span>مورد برمی‌گردد</span></div>'
           . '<div class="kpi' . ($nr ? ' hot' : '') . '"><b>' . $nr . '</b><span>مورد حذف می‌شود</span></div>'
           . '<div class="kpi"><b>' . $nc . '</b><span>مورد به حالت قدیمی برمی‌گردد</span></div></div>';
        $sections = array(
            array('added', '➕ برمی‌گردد (الان در فایل نیست)'),
            array('removed', '➖ حذف می‌شود (الان هست، در نسخه‌ی پشتیبان نیست)'),
        );
        foreach ($sections as $s) {
            if (!$cmp[$s[0]]) continue;
            $h .= '<h2>' . e($s[1]) . '</h2>';
            foreach (array_slice($cmp[$s[0]], 0, 40) as $x) $h .= '<div class="rw"><div class="grow">' . e($x['label']) . '</div></div>';
            if (count($cmp[$s[0]]) > 40) $h .= '<p class="hint">و ' . (count($cmp[$s[0]]) - 40) . ' مورد دیگر</p>';
        }
        if ($cmp['changed']) {
            $h .= '<h2>✏️ عوض می‌شود</h2>';
            foreach (array_slice($cmp['changed'], 0, 40) as $x) {
                $h .= '<div class="rw"><div class="grow"><b>' . e($x['label']) . '</b>';
                $i = 0;
                foreach ($x['diff'] as $field => $vals) {
                    if (++$i > 6) { $h .= '<div><small>و ' . (count($x['diff']) - 6) . ' فیلد دیگر</small></div>'; break; }
                    $h .= '<div><small><span class="ltr" style="display:inline-block">' . e($field) . '</span>: فعلی «' . e(hist_short($vals[0])) . '» ← پشتیبان «' . e(hist_short($vals[1])) . '»</small></div>';
                }
                $h .= '</div></div>';
            }
            if (count($cmp['changed']) > 40) $h .= '<p class="hint">و ' . (count($cmp['changed']) - 40) . ' مورد دیگر</p>';
        }
    }
    $h .= '<div class="btns" style="margin-top:16px"><form method="post" action="admin.php?a=restore" style="display:inline">'
       . '<input type="hidden" name="csrf" value="' . e(csrf_token()) . '"><input type="hidden" name="file" value="' . e(basename($p)) . '">'
       . '<button class="btn danger" type="submit">بازگردانی این نسخه</button></form> '
       . '<a class="btn alt" href="admin.php?a=security">انصراف</a></div></div>';
    return $h;
}
