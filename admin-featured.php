<?php
// ============================================================
// کادر چهره‌ها (ردیف افقی عکس زیر ویترین صفحه‌ی اصلی)
//   دیگر عکس جداگانه آپلود نمی‌شود: عکس، اسم و لینک هر مورد خودکار از خود نویسنده گرفته می‌شود
//   (همان عکسی که در فرم نویسنده گذاشته‌ای). حتی اگر نویسنده ۳۰ کتاب داشته باشد فقط یک‌بار ثبت می‌شود.
//   افزودن/برداشتن: از چک‌باکس «نمایش در کادر چهره‌ها» در فرم نویسنده، یا از همین صفحه.
//   داده: data/featured.json (فقط ترتیب و انتخاب نویسنده‌ها)
// ============================================================
const FEATURED_FILE = __DIR__ . '/data/featured.json';
const FEATURED_DIR  = __DIR__ . '/images/featured';

function featured_read() {
    $d = hist_read_file(FEATURED_FILE);
    $out = array();
    if (is_array($d)) foreach ($d as $it) {
        if (is_array($it) && !empty($it['id']) && !empty($it['authorId'])) $out[] = $it;
    }
    return $out;
}

function featured_delete_files($id) {
    foreach (array('jpg', 'jpeg', 'png', 'webp') as $e) @unlink(FEATURED_DIR . '/' . $id . '.' . $e);
}

function featured_has($authorId) {
    foreach (featured_read() as $it) if ($it['authorId'] === $authorId) return true;
    return false;
}

// نویسنده را به کادر چهره‌ها اضافه یا از آن برمی‌دارد. خروجی: true یا متن خطا
function featured_sync($authorId, $want) {
    $list = featured_read();
    $idx = null;
    foreach ($list as $i => $it) if ($it['authorId'] === $authorId) { $idx = $i; break; }
    if ($want && $idx === null) {
        $list[] = array('id' => 'f' . bin2hex(random_bytes(4)), 'authorId' => $authorId);
    } elseif (!$want && $idx !== null) {
        $old = $list[$idx];
        array_splice($list, $idx, 1);
        if (!empty($old['id']) && preg_match('/^f[0-9a-f]{8}$/', $old['id'])) featured_delete_files($old['id']);
    } else {
        return true; // تغییری لازم نیست
    }
    return save_json_file(FEATURED_FILE, 'featured', array_values($list));
}

function featured_handle_post($action) {
    if (!in_array($action, array('featured_add', 'featured_delete', 'featured_move'), true)) return;
    $back = 'admin.php?a=featured';
    $list = featured_read();

    if ($action === 'featured_add') {
        $aid = post('author_id');
        $author = null;
        foreach (read_authors() as $a) if (($a['id'] ?? '') === $aid) { $author = $a; break; }
        if (!$author) { flash('err', 'یک نویسنده از لیست انتخاب کن.'); redirect($back); }
        $r = featured_sync($aid, true);
        if ($r !== true) { flash('err', $r); redirect($back); }
        $note = author_photo_rel($author) === '' ? ' (هنوز عکسی برای او ثبت نشده؛ تا آن موقع ایموجی‌اش نمایش داده می‌شود — عکس را در ویرایش نویسنده بگذار.)' : '';
        flash('ok', 'به کادر چهره‌ها اضافه شد: «' . ($author['name']['fa'] ?? '') . '».' . $note);
        redirect($back);
    }

    if ($action === 'featured_delete') {
        $id = post('id'); $new = array(); $found = false;
        foreach ($list as $it) { if ($it['id'] === $id) $found = true; else $new[] = $it; }
        if (!$found) { flash('err', 'مورد پیدا نشد.'); redirect($back); }
        $r = save_json_file(FEATURED_FILE, 'featured', $new);
        if ($r !== true) { flash('err', $r); redirect($back); }
        if (preg_match('/^f[0-9a-f]{8}$/', $id)) featured_delete_files($id);
        flash('ok', 'از کادر چهره‌ها برداشته شد.');
        redirect($back);
    }

    if ($action === 'featured_move') {
        $id = post('id'); $dir = post('dir') === 'up' ? -1 : 1; $pos = null;
        foreach ($list as $i => $it) if ($it['id'] === $id) { $pos = $i; break; }
        if ($pos === null || !isset($list[$pos + $dir])) redirect($back);
        $tmp = $list[$pos]; $list[$pos] = $list[$pos + $dir]; $list[$pos + $dir] = $tmp;
        $r = save_json_file(FEATURED_FILE, 'featured', array_values($list));
        if ($r !== true) flash('err', $r);
        redirect($back);
    }
}

function featured_page() {
    $authors = read_authors();
    $byId = array();
    foreach ($authors as $a) $byId[$a['id'] ?? ''] = $a;
    $list = featured_read();
    $has = array();
    foreach ($list as $it) $has[$it['authorId']] = true;
    $csrf = '<input type="hidden" name="csrf" value="' . e(csrf_token()) . '">';

    page_head('کادر چهره‌ها', 'عکس‌هایی که زیر ویترین صفحه‌ی اصلی نمایش داده می‌شوند');

    echo '<div class="card"><h1>افزودن نویسنده به کادر</h1>'
       . '<p class="hint">عکس و اسم از خود نویسنده گرفته می‌شود (نیازی به آپلود دوباره نیست). کلیک روی عکس در سایت، کاربر را به صفحه‌ی اختصاصی همان نویسنده می‌برد و با رفتن موس روی عکس، نامش دیده می‌شود. '
       . 'برای تعویض عکس، آن را در «ویرایش نویسنده» عوض کن؛ همه‌جا خودکار به‌روز می‌شود.</p>';
    $avail = array();
    foreach ($authors as $a) if (!isset($has[$a['id'] ?? ''])) $avail[] = $a;
    if (!$authors) {
        echo '<div class="msg err">هنوز نویسنده‌ای ساخته نشده. اول از بخش «نویسنده‌ها» نویسنده اضافه کن.</div></div>';
    } elseif (!$avail) {
        echo '<p class="hint">همه‌ی نویسنده‌ها در کادر هستند.</p></div>';
    } else {
        echo '<form method="post" action="admin.php?a=featured_add" autocomplete="off">' . $csrf
           . '<label for="fAuthor">نویسنده</label><select name="author_id" id="fAuthor" required><option value="">— انتخاب کن —</option>';
        foreach ($avail as $a) {
            $label = ($a['name']['fa'] ?? '') . (isset($a['name']['en']) && $a['name']['en'] !== '' ? ' — ' . $a['name']['en'] : '')
                   . (author_photo_rel($a) === '' ? '  (بدون عکس)' : '');
            echo '<option value="' . e($a['id'] ?? '') . '">' . e($label) . '</option>';
        }
        echo '</select><div class="btns" style="margin-top:14px"><button class="btn" type="submit">افزودن به کادر</button></div></form></div>';
    }

    echo '<div class="card"><h1>نویسنده‌های فعلی در کادر</h1>';
    if (!$list) {
        echo '<p class="hint">هنوز کسی اضافه نشده است. تا وقتی اینجا چیزی نباشد، سایت همان ردیف پیش‌فرض را نشان می‌دهد (با عکس نویسنده‌هایی که عکس دارند)؛ با اولین مورد، فقط همین لیست نمایش داده می‌شود.</p>';
    } else {
        $n = count($list);
        foreach ($list as $i => $it) {
            $a = isset($byId[$it['authorId']]) ? $byId[$it['authorId']] : null;
            $img = $a ? author_photo_url($a) : '';
            echo '<div class="rw">'
               . ($img ? '<img src="' . e($img) . '" alt="" style="width:72px;height:72px;object-fit:cover;object-position:center top;border-radius:12px;background:#e7e9ee;flex-shrink:0">' : '<span style="width:72px;height:72px;border-radius:12px;background:#e7e9ee;display:inline-flex;align-items:center;justify-content:center;font-size:30px;flex-shrink:0">' . e($a['avatarEmoji'] ?? '📖') . '</span>')
               . '<div class="grow"><b>' . e($a ? ($a['name']['fa'] ?? '') : 'نویسنده‌ی حذف‌شده') . '</b>'
               . ($a ? '<br><small class="ltr" style="display:inline-block">' . (!empty($a['slug']) ? 'author-' . e($a['slug']) . '.html' : '—') . '</small>' : '<br><small>این نویسنده پاک شده؛ در سایت نمایش داده نمی‌شود. حذفش کن.</small>')
               . ($a && !$img ? '<br><small>عکس ندارد؛ در ویرایش نویسنده عکس بگذار.</small>' : '')
               . ($a && empty($a['slug']) ? '<br><small>آدرس (slug) ندارد؛ در ویرایش نویسنده یکی بده تا صفحه‌ی جدا داشته باشد.</small>' : '') . '</div>';
            foreach (array(array('up', '↑', $i > 0), array('down', '↓', $i < $n - 1)) as $mv) {
                echo '<form method="post" action="admin.php?a=featured_move">' . $csrf . '<input type="hidden" name="id" value="' . e($it['id']) . '"><input type="hidden" name="dir" value="' . $mv[0] . '">'
                   . '<button class="btn alt sm" type="submit" title="' . ($mv[0] === 'up' ? 'بالاتر (جلوتر در ردیف)' : 'پایین‌تر (عقب‌تر در ردیف)') . '"' . ($mv[2] ? '' : ' disabled') . '>' . $mv[1] . '</button></form>';
            }
            echo '<form method="post" action="admin.php?a=featured_delete" onsubmit="return confirm(\'این نویسنده از کادر چهره‌ها برداشته شود؟\')">' . $csrf
               . '<input type="hidden" name="id" value="' . e($it['id']) . '"><button class="btn danger sm" type="submit">برداشتن</button></form></div>';
        }
        echo '<p class="hint" style="margin-top:12px">ترتیب این لیست همان ترتیب عکس‌ها در سایت است (اولی از سمت راست).</p>';
    }
    echo '</div>';
}
