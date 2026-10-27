<?php
// ---------- عکس جلد کتاب ----------
// فایل images/books/<شماره‌ی کتاب>.jpg|png|webp — همه‌ی صفحه‌های سایت (صفحه‌ی کتاب، لیست کتاب‌ها، سبد، ذخیره‌ها، صفحه‌ی نویسنده) خودکار از همین فایل می‌خوانند.
const BOOK_COVER_DIR = __DIR__ . '/images/books';
function book_cover_remove_files($id) {
    $id = preg_replace('/[^a-z0-9]/', '', strtolower((string)$id));
    if ($id === '') return;
    foreach (array('jpg', 'jpeg', 'png', 'webp') as $e) @unlink(BOOK_COVER_DIR . '/' . $id . '.' . $e);
}
// خروجی: '' = تغییری نشد | 'ok' = ذخیره شد | 'removed' = حذف شد | '!متن خطا'
function handle_book_cover($b) {
    $id = preg_replace('/[^a-z0-9]/', '', strtolower((string)($b['id'] ?? '')));
    if ($id === '') return '';
    $has = !empty($_FILES['book_cover']) && $_FILES['book_cover']['error'] !== UPLOAD_ERR_NO_FILE;
    if (!$has) {
        if (post('remove_cover') === '1') { book_cover_remove_files($id); return 'removed'; }
        return '';
    }
    $f = $_FILES['book_cover'];
    if ($f['error'] !== UPLOAD_ERR_OK) return '!آپلود عکس جلد ناموفق بود (کد ' . $f['error'] . '). شاید حجم از حد سرور بیشتر است.';
    if ($f['size'] > PHOTO_MAX_MB * 1024 * 1024) return '!حجم عکس جلد بیشتر از ' . PHOTO_MAX_MB . ' مگابایت است.';
    $info = @getimagesize($f['tmp_name']);
    $map = array(IMAGETYPE_JPEG => 'jpg', IMAGETYPE_PNG => 'png', IMAGETYPE_WEBP => 'webp');
    if (!$info || !isset($map[$info[2]])) return '!فرمت عکس جلد باید JPG، PNG یا WEBP باشد.';
    $ext = $map[$info[2]];
    if (!is_dir(BOOK_COVER_DIR)) @mkdir(BOOK_COVER_DIR, 0755, true);
    if (!is_dir(BOOK_COVER_DIR)) return '!ساخت پوشه‌ی images/books ممکن نشد. دسترسی نوشتن پوشه‌ی images را بررسی کن.';
    // اول کوچک‌سازی (در صورت فعال بودن GD)؛ اگه نشد، فایل خام (حداکثر ۵ مگابایت)
    $dest = BOOK_COVER_DIR . '/' . $id . '.jpg';
    $tmpDest = BOOK_COVER_DIR . '/.new-' . $id . '.jpg';
    $opt = photo_optimize($f['tmp_name'], $info[2], $tmpDest);
    if ($opt === true) {
        book_cover_remove_files($id);
        if (!@rename($tmpDest, $dest)) { @unlink($tmpDest); return '!ذخیره‌ی عکس جلد ممکن نشد (دسترسی نوشتن).'; }
        return 'ok';
    }
    @unlink($tmpDest);
    if ($f['size'] > PHOTO_RAW_MAX_MB * 1024 * 1024) return '!کوچک‌سازی عکس جلد ممکن نشد (' . $opt . ') و حجم آن بیشتر از ' . PHOTO_RAW_MAX_MB . ' مگابایت است. عکس را کوچک‌تر کن.';
    book_cover_remove_files($id);
    if (!move_uploaded_file($f['tmp_name'], BOOK_COVER_DIR . '/' . $id . '.' . $ext)) return '!ذخیره‌ی عکس جلد ممکن نشد. دسترسی نوشتن پوشه‌ی images/books را بررسی کن.';
    return 'ok';
}

// ============================================================
// مدیریت سریع‌تر محتوا (بخش ۳)
//   • جستجو / فیلتر / مرتب‌سازی / صفحه‌بندی برای نویسنده‌ها و کتاب‌ها
//   • صفحه‌ی کتاب‌ها: ویرایش، تکثیر، حذف، ویرایش گروهی (ژانر و قیمت)
//   • ورود و خروج CSV (کتاب‌ها: ورود و خروج، نویسنده‌ها: خروج)
// این فایل فقط از admin.php (بعد از ورود ادمین) لود می‌شود و توابع آن را استفاده می‌کند.
// ============================================================

if (!function_exists('csrf_token')) { http_response_code(404); exit; }   // جلوگیری از اجرای مستقیم

const AUTHORS_PER_PAGE = 12;
const BOOKS_PER_PAGE   = 10;

// ---------- ابزارهای جستجو و مرتب‌سازی ----------
function norm_txt($s) {
    $s = fa_digits_to_en((string)$s);
    $s = strtr($s, array('ي' => 'ی', 'ك' => 'ک', 'ۀ' => 'ه', 'ة' => 'ه', "\xE2\x80\x8C" => ' ', "\xE2\x80\x8F" => '', "\xE2\x80\x8E" => ''));
    $s = function_exists('mb_strtolower') ? mb_strtolower($s, 'UTF-8') : strtolower($s);
    return trim(preg_replace('/\s+/u', ' ', $s));
}
function cmp_text($a, $b) {
    static $col = null;
    if ($col === null) $col = class_exists('Collator') ? @collator_create('fa') : false;
    if ($col) return collator_compare($col, (string)$a, (string)$b);
    return strcmp((string)$a, (string)$b);
}
function qs_with($over) {
    $q = $_GET;
    foreach ($over as $k => $v) { if ($v === null || $v === '') unset($q[$k]); else $q[$k] = $v; }
    return 'admin.php?' . http_build_query($q);
}
function gv($k) { return isset($_GET[$k]) && is_string($_GET[$k]) ? trim($_GET[$k]) : ''; }

function paginate_html($total, $page, $per) {
    $pages = max(1, (int)ceil($total / $per));
    if ($pages <= 1) return '';
    $out = '<nav class="pager" aria-label="صفحه‌بندی">';
    $link = function ($p, $label, $cls = '') { return '<a class="pg-b ' . $cls . '" href="' . e(qs_with(array('page' => $p > 1 ? $p : null))) . '">' . $label . '</a>'; };
    if ($page > 1) $out .= $link($page - 1, 'قبلی');
    $shown = array();
    for ($i = 1; $i <= $pages; $i++) if ($i === 1 || $i === $pages || abs($i - $page) <= 2) $shown[] = $i;
    $prev = 0;
    foreach ($shown as $i) {
        if ($prev && $i - $prev > 1) $out .= '<span class="pg-gap">…</span>';
        $out .= $i === $page ? '<span class="pg-b on">' . $i . '</span>' : $link($i, (string)$i);
        $prev = $i;
    }
    if ($page < $pages) $out .= $link($page + 1, 'بعدی');
    return $out . '</nav>';
}

function content_css() {
    return '<style>'
        . '.tools{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:14px}.tools input[type=text]{flex:1;min-width:200px;width:auto}.tools select{width:auto;min-width:140px}'
        . '.tbl{width:100%;border-collapse:collapse;background:var(--card);border:1px solid var(--b);border-radius:var(--r);overflow:hidden;font-size:.88rem}'
        . '.tbl th,.tbl td{padding:10px 12px;text-align:right;border-top:1px solid var(--b);vertical-align:middle}.tbl thead th{border-top:0;background:rgba(128,128,128,.08);font-size:.8rem;white-space:nowrap}'
        . '.tbl td.num{direction:ltr;text-align:left;white-space:nowrap}.tbl .acts{display:flex;gap:6px;flex-wrap:wrap}.tbl form{margin:0}'
        . '.tblwrap{overflow-x:auto;border-radius:var(--r)}'
        . '.pager{display:flex;gap:6px;flex-wrap:wrap;align-items:center;justify-content:center;margin:18px 0}'
        . '.pg-b{min-width:36px;height:36px;padding:0 10px;display:inline-grid;place-items:center;border:1px solid var(--b);border-radius:9px;background:var(--card);color:var(--t);text-decoration:none;font-size:.86rem}.pg-b.on{background:var(--p);border-color:var(--p);color:#fff}a.pg-b:hover{border-color:var(--m)}.pg-gap{color:var(--m)}'
        . '.bulkbar{display:none;position:sticky;top:8px;z-index:6;background:var(--card);border:1px solid var(--p);border-radius:var(--r);padding:12px 14px;margin-bottom:12px;box-shadow:0 8px 24px rgba(20,24,33,.14)}.bulkbar.on{display:block}'
        . '.bulkbar .brow{display:flex;gap:10px;flex-wrap:wrap;align-items:center}.bulkbar select,.bulkbar input[type=text]{width:auto;min-width:130px}.bulkbar label{margin:0;font-weight:400}'
        . '.ac .acts{flex-wrap:wrap}.resultinfo{color:var(--m);font-size:.84rem;margin:0 0 10px}'
        . '@media(max-width:760px){.tblwrap{overflow:visible}.tbl,.tbl tbody{display:block;background:none;border:0}.tbl thead{display:none}'
        . '.tbl tr{display:grid;grid-template-columns:auto 1fr auto;gap:2px 10px;background:var(--card);border:1px solid var(--b);border-radius:var(--r);padding:12px;margin-bottom:10px}'
        . '.tbl td{border:0;padding:0}.tbl td.c-chk{grid-row:1;grid-column:1;align-self:start;padding:0;min-width:44px;min-height:44px;display:flex;align-items:center;justify-content:center;margin:-8px -8px 0 0;cursor:pointer}.tbl td.c-chk input{width:24px;height:24px;margin:0}'
        . '.tbl td.c-title{grid-row:1;grid-column:2/4}.tbl td.c-author{grid-column:2/4;color:var(--m);font-size:.84rem}.tbl td.c-genre{grid-column:2/4;margin:4px 0}'
        . '.tbl td.c-price,.tbl td.c-pages{grid-column:2/4;text-align:right;direction:rtl;font-size:.84rem;display:inline}.tbl td.num::before{content:attr(data-l) ": ";color:var(--m)}'
        . '.tbl td.c-acts{grid-column:1/4;margin-top:8px}.tbl .acts .btn{min-height:44px}.tbl .acts>*{flex:1}.tbl .acts form .btn{width:100%}}'
        . '@media(pointer:coarse),(max-width:760px){.pg-b{min-width:44px;height:44px}.ac .pg a{display:inline-flex;align-items:center;justify-content:center;min-width:44px;min-height:44px}.tbl td.c-chk,.tbl th:first-child{min-width:44px;text-align:center}.tbl td.c-chk{cursor:pointer}}'
        . '@media(max-width:760px){.tools select,.tools .btn{flex:1}.bulkbar select,.bulkbar input[type=text]{flex:1}}'
        . '</style>';
}

// ---------- کتاب‌ها: خواندن و اعتبارسنجی ----------
function authors_by_id($authors) {
    $m = array();
    foreach ($authors as $a) if (isset($a['id'])) $m[$a['id']] = $a;
    return $m;
}
function book_cats() {
    return array('fiction' => 'رمان و داستان', 'literature' => 'ادبیات', 'philosophy' => 'فلسفه', 'psychology' => 'روان‌شناسی', 'success' => 'موفقیت و خودیاری');
}
function book_find_index($books, $id) {
    foreach ($books as $i => $b) if ((string)($b['id'] ?? '') === (string)$id) return $i;
    return null;
}
function author_is_single($authorsById, $aid) { return !empty($authorsById[$aid]['singleBook']); }

// تعداد کتاب‌های هر نویسنده (یک‌بار برای همه)
function book_counts($books) {
    $c = array();
    foreach ($books as $b) { $k = $b['authorId'] ?? ''; $c[$k] = ($c[$k] ?? 0) + 1; }
    return $c;
}

// ---------- عملیات POST ----------
function content_handle_post($action) {
    global $GENRE_GROUPS;
    $acts = array('book_save', 'book_dup', 'book_delete', 'book_bulk', 'books_import');
    if (!in_array($action, $acts, true)) return;
    $back = 'admin.php?a=books';

    if ($action === 'book_dup') {
        $books = read_books(); $authors = authors_by_id(read_authors());
        $i = book_find_index($books, post('id'));
        if ($i === null) { flash('err', 'کتاب پیدا نشد.'); redirect($back); }
        if (author_is_single($authors, $books[$i]['authorId'] ?? '')) { flash('err', 'این نویسنده «تک‌کتابی» است و فقط یک کتاب می‌تواند داشته باشد. اول از ویرایش نویسنده، گزینه‌ی تک‌کتابی را بردار.'); redirect($back); }
        $c = $books[$i];
        $c['id'] = next_book_id($books);
        $c['title']['fa'] = ($c['title']['fa'] ?? '') . ' (کپی)';
        $c['title']['en'] = ($c['title']['en'] ?? '') . ' (Copy)';
        $c['isFamous'] = false;
        unset($c['newSeq']); // کپی به‌طور خودکار جدیدترین نمی‌شود
        unset($c['pdf']); // فایل PDF کپی نمی‌شود
        $c['salesSite'] = 0; $c['salesIran'] = 0; $c['salesWorld'] = 0;
        $books[] = $c;
        $r = save_books($books);
        if ($r !== true) { flash('err', $r); redirect($back); }
        flash('ok', 'کپی کتاب ساخته شد؛ عنوان و جزئیاتش را اصلاح کن. (آمار فروش کپی صفر است.)');
        redirect('admin.php?a=book_edit&id=' . urlencode($c['id']));
    }

    if ($action === 'book_delete') {
        $books = read_books(); $authors = authors_by_id(read_authors());
        $i = book_find_index($books, post('id'));
        if ($i === null) { flash('err', 'کتاب پیدا نشد.'); redirect($back); }
        if (author_is_single($authors, $books[$i]['authorId'] ?? '')) { flash('err', 'کتابِ نویسنده‌ی «تک‌کتابی» را از اینجا نمی‌شود حذف کرد؛ نویسنده را حذف یا نوعش را عوض کن.'); redirect($back); }
        $t = $books[$i]['title']['fa'] ?? '';
        $delBook = $books[$i];
        array_splice($books, $i, 1);
        $r = save_books($books);
        if ($r === true) { pdf_delete_file($delBook); book_cover_remove_files($delBook['id'] ?? ''); }
        flash($r === true ? 'ok' : 'err', $r === true ? 'کتاب «' . $t . '» حذف شد (نسخه‌ی پشتیبان در data/backups هست).' : $r);
        redirect($back);
    }

    if ($action === 'book_save') {
        $books = read_books(); $authors = authors_by_id(read_authors());
        $id = post('id');
        $isNew = ($id === 'new');
        $i = $isNew ? null : book_find_index($books, $id);
        if (!$isNew && $i === null) { flash('err', 'کتاب پیدا نشد.'); redirect($back); }
        $b = $isNew ? array('id' => next_book_id($books), 'salesSite' => 0, 'salesIran' => 0, 'salesWorld' => 0) : $books[$i];
        $err = array();
        $tfa = post('title_fa'); $aid = post('authorId'); $gg = post('genreGroup'); $cat = post('category');
        $price = fa_digits_to_en(post('totalPrice')); $pages = fa_digits_to_en(post('pages'));
        if ($tfa === '') $err[] = 'نام فارسی کتاب لازم است.';
        if (!isset($authors[$aid])) $err[] = 'نویسنده را انتخاب کن.';
        if (!isset($GENRE_GROUPS[$gg])) $err[] = 'ژانر را انتخاب کن.';
        if (!isset(book_cats()[$cat])) $err[] = 'دسته‌ی کتاب نامعتبر است.';
        if (!preg_match('/^\d{1,9}$/', $price)) $err[] = 'قیمت باید عدد باشد.';
        if (!preg_match('/^[1-9]\d{0,4}$/', $pages)) $err[] = 'تعداد صفحه باید عدد بزرگ‌تر از صفر باشد.';
        $oldAid = $b['authorId'] ?? '';
        if (isset($authors[$aid]) && $aid !== $oldAid) {
            if (!$isNew && author_is_single($authors, $oldAid)) $err[] = 'نویسنده‌ی این کتاب «تک‌کتابی» است و عوض نمی‌شود.';
            if (author_is_single($authors, $aid)) {
                $has = false; foreach ($books as $ob) if (($ob['authorId'] ?? '') === $aid) { $has = true; break; }
                if (!$isNew || $has) $err[] = 'نویسنده‌ی انتخاب‌شده «تک‌کتابی» است و قبلاً یک کتاب دارد.';
            }
        }
        $slugIn = strtolower(trim(post('slug')));
        $slugClean = trim(preg_replace('/[^a-z0-9]+/', '-', $slugIn), '-');
        if ($slugIn !== '' && $slugClean === '') $err[] = 'آدرس صفحه (URL) فقط با حروف انگلیسی، عدد و خط تیره ساخته می‌شود.';
        if (strlen($slugClean) > 60) $slugClean = trim(substr($slugClean, 0, 60), '-');
        if ($err) { $_SESSION['old'] = $_POST; flash('err', implode("\n", $err)); redirect('admin.php?a=book_edit&id=' . urlencode($id)); }
        $t = pair('title_fa', 'title_en');
        if ($slugClean !== '') $b['slug'] = $slugClean; else unset($b['slug']);
        $d = pair('desc_fa', 'desc_en');
        $pb = pair('publisher_fa', 'publisher_en'); $tr = pair('translator_fa', 'translator_en');
        $b['title'] = $t;
        $b['authorId'] = $aid;
        $b['author'] = $authors[$aid]['name'] ?? array('fa' => '', 'en' => '');
        $gl = all_genre_groups();
        $b['genreGroup'] = $gg;
        $b['genre'] = array('fa' => $gl[$gg]['fa'], 'en' => $gl[$gg]['en']);
        $b['category'] = $cat;
        $b['publisher'] = $pb ? $pb : array('fa' => '', 'en' => '');
        $b['translator'] = $tr ? $tr : array('fa' => '', 'en' => '');
        $b['pages'] = (int)$pages;
        $b['totalPrice'] = (int)$price;
        $b['isFamous'] = (post('isFamous') === '1');
        // شماره‌ی ترتیب «جدیدترین»: هر کتاب تازه‌ی تیک‌خورده، بزرگ‌ترین شماره را می‌گیرد (بزرگ‌تر = جدیدتر)
        if (post('newArrival') === '1') {
            if (empty($b['newSeq'])) { $maxSeq = 0; foreach ($books as $ob) $maxSeq = max($maxSeq, (int)($ob['newSeq'] ?? 0)); $b['newSeq'] = $maxSeq + 1; }
        } else { unset($b['newSeq']); }
        $b['desc'] = $d ? $d : array('fa' => '', 'en' => '');
        // بیوگرافی بلند جدا از توضیح کوتاه است و هیچ‌وقت خودکار با آن بازنویسی نمی‌شود.
        // اگر ادمین چیزی نوشته باشد همان ذخیره می‌شود. اگر هر دو کادر را خالی گذاشته باشد، خودش انتخاب می‌کند (bio_empty):
        //   desc  = بیوگرافی پاک شود و توضیح کوتاه جایگزینش شود (پیش‌فرض)
        //   empty = بیوگرافی کاملاً خالی شود
        //   keep  = بیوگرافی قبلی دست نخورد
        $bioIn = pair('bio_fa', 'bio_en');
        $bioMode = post('bio_empty');
        if ($bioIn) $b['bio'] = $bioIn;
        elseif ($bioMode === 'empty') $b['bio'] = array('fa' => '', 'en' => '');
        elseif ($bioMode === 'keep' && (!empty($b['bio']['fa']) || !empty($b['bio']['en']))) { /* بیوگرافی قبلی می‌ماند */ }
        else $b['bio'] = $b['desc'];
        $coverRes = handle_book_cover($b);
        if ($coverRes !== '' && $coverRes[0] === '!') { $_SESSION['old'] = $_POST; flash('err', substr($coverRes, 1)); redirect('admin.php?a=book_edit&id=' . urlencode($id)); }
        handle_pdf_remove($b);
        $pdfRes = handle_pdf_upload('book_pdf', $b);
        if ($pdfRes !== '' && $pdfRes[0] === '!') { $_SESSION['old'] = $_POST; flash('err', substr($pdfRes, 1)); redirect('admin.php?a=book_edit&id=' . urlencode($id)); }
        handle_pdf_kind($b);
        if ($isNew) $books[] = $b; else $books[$i] = $b;
        $r = save_books($books);
        if ($r !== true) { $_SESSION['old'] = $_POST; flash('err', $r); redirect('admin.php?a=book_edit&id=' . urlencode($id)); }
        pdf_finish_changes(true);
        unset($_SESSION['old']);
        flash('ok', ($isNew ? 'کتاب جدید ساخته شد.' : 'کتاب ذخیره شد.') . ($pdfRes === 'ok' ? ' فایل PDF هم بارگذاری شد.' : '') . ($coverRes === 'ok' ? ' عکس جلد هم ذخیره شد.' : ($coverRes === 'removed' ? ' عکس جلد حذف شد (اسم کتاب به‌جایش نمایش داده می‌شود).' : '')));
        redirect($back);
    }

    if ($action === 'book_bulk') {
        $ids = (isset($_POST['ids']) && is_array($_POST['ids'])) ? array_map('strval', $_POST['ids']) : array();
        if (!$ids) { flash('err', 'هیچ کتابی انتخاب نشده بود.'); redirect($back); }
        $gg = post('bulk_genre');
        $mode = post('bulk_price_mode');   // '', set, inc, dec
        $val = fa_digits_to_en(post('bulk_price'));
        $err = array();
        if ($gg !== '' && !isset($GENRE_GROUPS[$gg])) $err[] = 'ژانر نامعتبر است.';
        if ($mode !== '' && !in_array($mode, array('set', 'inc', 'dec'), true)) $err[] = 'نوع تغییر قیمت نامعتبر است.';
        if ($mode !== '' && !preg_match('/^\d{1,9}(\.\d{1,2})?$/', $val)) $err[] = 'مقدار قیمت باید عدد باشد.';
        if ($mode === 'inc' && is_numeric($val) && (float)$val > 100) $err[] = 'افزایش درصدی بیشتر از ۱۰۰ مجاز نیست؛ مقدار «درصد» است، نه تومان. برای تعیین مبلغ از «قیمت را برابر کن با» استفاده کن.';
        if ($mode === 'dec' && is_numeric($val) && (float)$val > 100) $err[] = 'کاهش درصدی نمی‌تواند بیشتر از ۱۰۰ باشد.';
        if ($gg === '' && $mode === '') $err[] = 'ژانر یا قیمت را برای تغییر مشخص کن.';
        if ($err) { flash('err', implode("\n", $err)); redirect(isset($_POST['return']) && is_string($_POST['return']) && strpos($_POST['return'], 'admin.php?a=books') === 0 ? $_POST['return'] : $back); }
        $books = read_books(); $gl = all_genre_groups(); $n = 0;
        foreach ($books as $i => $b) {
            if (!in_array((string)($b['id'] ?? ''), $ids, true)) continue;
            if ($gg !== '') { $books[$i]['genreGroup'] = $gg; $books[$i]['genre'] = array('fa' => $gl[$gg]['fa'], 'en' => $gl[$gg]['en']); }
            if ($mode !== '') {
                $p = (float)($b['totalPrice'] ?? 0); $f = (float)$val;
                if ($mode === 'set') $p = $f;
                elseif ($mode === 'inc') $p = $p * (1 + $f / 100);
                else $p = $p * (1 - $f / 100);
                $books[$i]['totalPrice'] = max(0, (int)round($p));
            }
            $n++;
        }
        $r = save_books($books);
        flash($r === true ? 'ok' : 'err', $r === true ? $n . ' کتاب به‌روزرسانی شد.' : $r);
        $ret = (isset($_POST['return']) && is_string($_POST['return']) && strpos($_POST['return'], 'admin.php?a=books') === 0) ? $_POST['return'] : $back;
        redirect($ret);
    }

    if ($action === 'books_import') {
        if (!empty($_FILES['csv']) && in_array($_FILES['csv']['error'], array(UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE), true)) { flash('err', 'حجم فایل از سقف PHP سرور بیشتر است (upload_max_filesize = ' . ini_get('upload_max_filesize') . '، post_max_size = ' . ini_get('post_max_size') . '). این مقدارها را در php.ini بالا ببر و Apache را ریستارت کن.'); redirect($back); }
        if (empty($_FILES['csv']) || $_FILES['csv']['error'] !== UPLOAD_ERR_OK) { flash('err', 'فایل CSV انتخاب نشد یا آپلود ناموفق بود.'); redirect($back); }
        // محدودیت حجم CSV برداشته شد (سقف واقعی فقط upload_max_filesize / post_max_size سرور است)
        @set_time_limit(0); @ini_set('memory_limit', '512M');
        $res = books_import_csv($_FILES['csv']['tmp_name']);
        if (is_string($res)) { flash('err', $res); redirect($back); }
        $msg = $res['added'] . ' کتاب جدید اضافه و ' . $res['updated'] . ' کتاب به‌روزرسانی شد.';
        if ($res['errors']) $msg .= "\n" . count($res['errors']) . ' ردیف رد شد:' . "\n" . implode("\n", array_slice($res['errors'], 0, 10)) . (count($res['errors']) > 10 ? "\n…" : '');
        flash($res['added'] + $res['updated'] > 0 ? 'ok' : 'err', $msg);
        redirect($back);
    }
}

// ---------- CSV ----------
function csv_safe($v) {
    $v = (string)$v;
    if ($v !== '' && strpos("=+@\t\r", $v[0]) !== false) return "'" . $v;   // جلوگیری از اجرای فرمول در اکسل
    if ($v !== '' && $v[0] === '-' && !preg_match('/^-\d/', $v)) return "'" . $v;
    return $v;
}
function csv_unsafe($v) {
    if (strlen($v) > 1 && $v[0] === "'" && strpos("=+@-\t\r", $v[1]) !== false) return substr($v, 1);
    return $v;
}
function csv_output($filename, $header, $rows) {
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="' . $filename . '"');
    $out = fopen('php://output', 'w');
    fwrite($out, "\xEF\xBB\xBF");   // BOM تا اکسل فارسی را درست نشان بدهد
    fputcsv($out, $header, ',', '"', '\\');
    foreach ($rows as $r) fputcsv($out, array_map('csv_safe', $r), ',', '"', '\\');
    fclose($out);
    exit;
}
function books_csv_header() {
    return array('id', 'title_fa', 'title_en', 'authorId', 'author_fa', 'genreGroup', 'category', 'publisher_fa', 'publisher_en', 'translator_fa', 'translator_en', 'pages', 'totalPrice', 'isFamous', 'desc_fa', 'desc_en', 'bio_fa', 'bio_en');
}
function content_export($action) {
    if ($action === 'books_csv') {
        $rows = array();
        foreach (read_books() as $b) {
            $rows[] = array($b['id'] ?? '', $b['title']['fa'] ?? '', $b['title']['en'] ?? '', $b['authorId'] ?? '', $b['author']['fa'] ?? '',
                $b['genreGroup'] ?? '', $b['category'] ?? '', $b['publisher']['fa'] ?? '', $b['publisher']['en'] ?? '',
                $b['translator']['fa'] ?? '', $b['translator']['en'] ?? '', $b['pages'] ?? '', $b['totalPrice'] ?? '',
                !empty($b['isFamous']) ? '1' : '0', $b['desc']['fa'] ?? '', $b['desc']['en'] ?? '', $b['bio']['fa'] ?? '', $b['bio']['en'] ?? '');
        }
        csv_output('books-' . date('Ymd-His') . '.csv', books_csv_header(), $rows);
    }
    if ($action === 'authors_csv') {
        $counts = book_counts(read_books());
        $rows = array();
        foreach (read_authors() as $a) {
            $rows[] = array($a['id'] ?? '', $a['slug'] ?? '', $a['name']['fa'] ?? '', $a['name']['en'] ?? '', $a['birthYear'] ?? '',
                $a['deathYear'] ?? '', $a['nationality']['fa'] ?? '', $a['genreGroup'] ?? '', $counts[$a['id'] ?? ''] ?? 0, !empty($a['singleBook']) ? '1' : '0');
        }
        csv_output('authors-' . date('Ymd-His') . '.csv', array('id', 'slug', 'name_fa', 'name_en', 'birthYear', 'deathYear', 'nationality_fa', 'genreGroup', 'bookCount', 'singleBook'), $rows);
    }
}

// خروجی: رشته‌ی خطا، یا آرایه‌ی added/updated/errors
function books_import_csv($tmp) {
    global $GENRE_GROUPS;
    $raw = (string)@file_get_contents($tmp);
    if (substr($raw, 0, 3) === "\xEF\xBB\xBF") $raw = substr($raw, 3);
    if ($raw === '') return 'فایل خالی است.';
    if (substr($raw, 0, 4) === '%PDF') return 'این فایل PDF است، نه CSV! «ورود از CSV» فقط برای اطلاعات کتاب‌هاست. فایل PDF هر کتاب را از صفحه‌ی «ویرایش» همان کتاب آپلود کن.';
    if (strpos(substr($raw, 0, 4096), "\0") !== false) return 'این فایل متنی (CSV) نیست.';
    if (!preg_match('//u', $raw)) {
        $conv = false;
        if (function_exists('iconv')) $conv = @iconv('CP1256', 'UTF-8//IGNORE', $raw);
        if ($conv === false || $conv === '') {
            try { if (function_exists('mb_convert_encoding')) $conv = @mb_convert_encoding($raw, 'UTF-8', 'CP1256'); } catch (\Throwable $e) { $conv = false; }
        }
        if (is_string($conv) && $conv !== '') $raw = $conv;
        if (!preg_match('//u', $raw)) return 'فایل باید با کدگذاری UTF-8 ذخیره شده باشد (در اکسل: CSV UTF-8).';
    }
    $first = strtok($raw, "\n");
    $delim = (substr_count($first, ';') > substr_count($first, ',')) ? ';' : ',';
    $fh = fopen('php://temp', 'r+'); fwrite($fh, $raw); rewind($fh);
    $head = fgetcsv($fh, 0, $delim, '"', '\\');
    if (!$head) return 'سطر عنوان ستون‌ها خوانده نشد.';
    $head = array_map(function ($h) { return trim((string)$h); }, $head);
    foreach (array('title_fa', 'authorId', 'genreGroup', 'totalPrice', 'pages') as $need)
        if (!in_array($need, $head, true)) return 'ستون «' . $need . '» در فایل نیست. بهتر است اول خروجی CSV بگیری و همان قالب را ویرایش کنی.';

    $books = read_books(); $authors = authors_by_id(read_authors()); $gl = all_genre_groups(); $cats = book_cats();
    $added = 0; $updated = 0; $errors = array(); $line = 1;
    while (($row = fgetcsv($fh, 0, $delim, '"', '\\')) !== false) {
        $line++;
        if (count($row) === 1 && trim((string)$row[0]) === '') continue;
        $r = array();
        foreach ($head as $ci => $h) $r[$h] = csv_unsafe(trim((string)($row[$ci] ?? '')));
        $g = function ($k) use ($r) { return isset($r[$k]) ? $r[$k] : ''; };
        $price = fa_digits_to_en($g('totalPrice')); $pages = fa_digits_to_en($g('pages'));
        $aid = $g('authorId'); $gg = $g('genreGroup'); $cat = $g('category') !== '' ? $g('category') : 'fiction';
        $id = $g('id');
        $bad = '';
        if ($g('title_fa') === '') $bad = 'نام فارسی کتاب خالی است';
        elseif (!isset($authors[$aid])) $bad = 'authorId «' . $aid . '» وجود ندارد';
        elseif (!isset($GENRE_GROUPS[$gg])) $bad = 'genreGroup «' . $gg . '» وجود ندارد';
        elseif (!isset($cats[$cat])) $bad = 'category «' . $cat . '» نامعتبر است';
        elseif (!preg_match('/^\d{1,9}$/', $price)) $bad = 'قیمت عدد نیست';
        elseif (!preg_match('/^[1-9]\d{0,4}$/', $pages)) $bad = 'تعداد صفحه نامعتبر است';
        $idx = ($id !== '') ? book_find_index($books, $id) : null;
        if ($bad === '' && $id !== '' && $idx === null) $bad = 'id «' . $id . '» در کتاب‌های فعلی نیست (برای کتاب جدید، ستون id را خالی بگذار)';
        if ($bad === '') {
            $oldAid = ($idx !== null) ? ($books[$idx]['authorId'] ?? '') : '';
            if (author_is_single($authors, $aid) && $aid !== $oldAid) $bad = 'نویسنده «تک‌کتابی» است';
            elseif ($idx !== null && author_is_single($authors, $oldAid) && $aid !== $oldAid) $bad = 'نویسنده‌ی کتابِ تک‌کتابی عوض نمی‌شود';
        }
        if ($bad !== '') { $errors[] = 'سطر ' . $line . ': ' . $bad; continue; }

        $b = ($idx !== null) ? $books[$idx] : array('isFamous' => false, 'salesSite' => 0, 'salesIran' => 0, 'salesWorld' => 0);
        $en = function ($fa, $enk) use ($g) { return $g($enk) !== '' ? $g($enk) : $g($fa); };
        $b['title'] = array('fa' => $g('title_fa'), 'en' => $en('title_fa', 'title_en'));
        $b['authorId'] = $aid;
        $b['author'] = $authors[$aid]['name'] ?? array('fa' => '', 'en' => '');
        $b['genreGroup'] = $gg;
        $b['genre'] = array('fa' => $gl[$gg]['fa'], 'en' => $gl[$gg]['en']);
        $b['category'] = $cat;
        $b['publisher'] = array('fa' => $g('publisher_fa'), 'en' => $en('publisher_fa', 'publisher_en'));
        $b['translator'] = array('fa' => $g('translator_fa'), 'en' => $en('translator_fa', 'translator_en'));
        $b['pages'] = (int)$pages;
        $b['totalPrice'] = (int)$price;
        if (isset($r['isFamous'])) $b['isFamous'] = in_array(strtolower($r['isFamous']), array('1', 'true', 'yes', 'بله'), true);
        $b['desc'] = array('fa' => $g('desc_fa'), 'en' => $en('desc_fa', 'desc_en'));
        // بیوگرافی: اگر ستون bio_fa/bio_en در فایل هست و پر است همان؛ در غیر این صورت بیوگرافی فعلی کتاب دست‌نخورده می‌ماند
        // (کتاب جدید بدون بیوگرافی، توضیح کوتاه را به‌عنوان بیوگرافی می‌گیرد)
        if ($g('bio_fa') !== '' || $g('bio_en') !== '') $b['bio'] = array('fa' => $g('bio_fa'), 'en' => $en('bio_fa', 'bio_en'));
        elseif (empty($b['bio']['fa']) && empty($b['bio']['en'])) $b['bio'] = $b['desc'];
        if ($idx !== null) { $books[$idx] = $b; $updated++; }
        else { $b['id'] = next_book_id($books); $books[] = $b; $added++; }
    }
    fclose($fh);
    if ($added + $updated > 0) {
        $GLOBALS['HIST_OP'] = 'import';   // در لاگ تغییرات به‌عنوان «ورود از CSV» ثبت شود
        $s = save_books($books);
        unset($GLOBALS['HIST_OP']);
        if ($s !== true) return $s;
    }
    return array('added' => $added, 'updated' => $updated, 'errors' => $errors);
}

// ---------- صفحه‌ی لیست کتاب‌ها ----------
function content_books_list() {
    global $GENRE_GROUPS;
    $books = read_books(); $authors = authors_by_id(read_authors());
    $q = norm_txt(gv('q')); $fg = gv('genre'); $fc = gv('cat'); $fa = gv('author'); $sort = gv('sort');
    $page = max(1, (int)gv('page'));
    $cats = book_cats();

    $rows = array();
    foreach ($books as $b) {
        if ($fg !== '' && ($b['genreGroup'] ?? '') !== $fg) continue;
        if ($fc !== '' && ($b['category'] ?? '') !== $fc) continue;
        if ($fa !== '' && ($b['authorId'] ?? '') !== $fa) continue;
        if ($q !== '') {
            $hay = norm_txt(($b['title']['fa'] ?? '') . ' ' . ($b['title']['en'] ?? '') . ' ' . ($b['author']['fa'] ?? '') . ' ' . ($b['author']['en'] ?? '') . ' ' . ($b['publisher']['fa'] ?? '') . ' ' . ($b['translator']['fa'] ?? ''));
            if (strpos($hay, $q) === false) continue;
        }
        $rows[] = $b;
    }
    $sorts = array('new' => 'جدیدترین', 'title' => 'نام کتاب', 'author' => 'نویسنده', 'price_a' => 'قیمت: کم به زیاد', 'price_d' => 'قیمت: زیاد به کم', 'pages' => 'تعداد صفحه', 'sales' => 'پرفروش‌ترین');
    if (!isset($sorts[$sort])) $sort = 'new';
    usort($rows, function ($x, $y) use ($sort) {
        switch ($sort) {
            case 'title':   return cmp_text($x['title']['fa'] ?? '', $y['title']['fa'] ?? '');
            case 'author':  return cmp_text($x['author']['fa'] ?? '', $y['author']['fa'] ?? '');
            case 'price_a': return ($x['totalPrice'] ?? 0) <=> ($y['totalPrice'] ?? 0);
            case 'price_d': return ($y['totalPrice'] ?? 0) <=> ($x['totalPrice'] ?? 0);
            case 'pages':   return ($y['pages'] ?? 0) <=> ($x['pages'] ?? 0);
            case 'sales':   return ($y['salesSite'] ?? 0) <=> ($x['salesSite'] ?? 0);
            default:        return (int)($y['id'] ?? 0) <=> (int)($x['id'] ?? 0);
        }
    });
    $total = count($rows);
    $pages = max(1, (int)ceil($total / BOOKS_PER_PAGE));
    if ($page > $pages) $page = $pages;
    $slice = array_slice($rows, ($page - 1) * BOOKS_PER_PAGE, BOOKS_PER_PAGE);

    echo content_css();
    page_head('کتاب‌ها', 'جستجو، ویرایش، تکثیر و ویرایش گروهی کتاب‌ها',
        '<div class="qa" style="margin:0"><a class="btn" href="admin.php?a=book_edit&id=new">' . icon('plus') . 'کتاب جدید</a><a class="btn alt" href="admin.php?a=books_csv">خروجی CSV</a>'
        . '<button class="btn alt" type="button" id="impBtn">ورود از CSV</button></div>');
    echo '<form id="impForm" method="post" action="admin.php?a=books_import" enctype="multipart/form-data" style="display:none"><input type="hidden" name="csrf" value="' . e(csrf_token()) . '"><input type="file" name="csv" id="impFile" accept=".csv,text/csv"></form>';
    echo '<p class="hint">ورود از CSV: ردیفی که id دارد، همان کتاب را ویرایش می‌کند؛ ردیف بدون id، کتاب جدید می‌سازد. بهترین راه: اول «خروجی CSV» بگیر و همان فایل را ویرایش کن. آمار فروش دست نمی‌خورد.</p>';

    echo '<form class="tools" method="get" action="admin.php"><input type="hidden" name="a" value="books">'
       . '<input type="text" name="q" value="' . e(gv('q')) . '" placeholder="جستجو در نام کتاب، نویسنده، ناشر، مترجم…">';
    echo '<select name="genre"><option value="">همه‌ی ژانرها</option>';
    foreach ($GENRE_GROUPS as $k => $l) echo '<option value="' . e($k) . '"' . ($fg === $k ? ' selected' : '') . '>' . e($l) . '</option>';
    echo '</select><select name="cat"><option value="">همه‌ی دسته‌ها</option>';
    foreach ($cats as $k => $l) echo '<option value="' . e($k) . '"' . ($fc === $k ? ' selected' : '') . '>' . e($l) . '</option>';
    echo '</select><select name="author"><option value="">همه‌ی نویسنده‌ها</option>';
    foreach ($authors as $k => $a) echo '<option value="' . e($k) . '"' . ($fa === $k ? ' selected' : '') . '>' . e($a['name']['fa'] ?? $k) . '</option>';
    echo '</select><select name="sort">';
    foreach ($sorts as $k => $l) echo '<option value="' . e($k) . '"' . ($sort === $k ? ' selected' : '') . '>' . e($l) . '</option>';
    echo '</select><button class="btn" type="submit">اعمال</button>';
    if ($q !== '' || $fg !== '' || $fc !== '' || $fa !== '' || gv('sort') !== '') echo '<a class="btn alt" href="admin.php?a=books">پاک‌کردن</a>';
    echo '</form>';
    echo '<p class="resultinfo">' . $total . ' کتاب از ' . count($books) . ' کتاب' . ($pages > 1 ? ' — صفحه‌ی ' . $page . ' از ' . $pages : '') . '</p>';

    $ret = qs_with(array());
    echo '<div class="bulkbar" id="bulkBar"><form id="bulkForm" method="post" action="admin.php?a=book_bulk" onsubmit="return confirm(\'تغییر روی کتاب‌های انتخاب‌شده اعمال شود؟\')">'
       . '<input type="hidden" name="csrf" value="' . e(csrf_token()) . '"><input type="hidden" name="return" value="' . e($ret) . '">'
       . '<div class="brow"><b id="bulkCount">۰</b><span>کتاب انتخاب شده —</span>'
       . '<select name="bulk_genre"><option value="">ژانر: بدون تغییر</option>';
    foreach ($GENRE_GROUPS as $k => $l) echo '<option value="' . e($k) . '">' . e($l) . '</option>';
    echo '</select><select name="bulk_price_mode" onchange="var i=this.form.bulk_price;i.placeholder=this.value==\'set\'?\'مبلغ (تومان)\':(this.value?\'درصد (٪)\':\'مقدار\')"><option value="">قیمت: بدون تغییر</option><option value="set">قیمت را برابر کن با (تومان)</option><option value="inc">افزایش درصدی</option><option value="dec">کاهش درصدی</option></select>'
       . '<input type="text" name="bulk_price" class="ltr" inputmode="decimal" placeholder="مقدار" style="max-width:110px">'
       . '<button class="btn sm" type="submit">اعمال روی انتخاب‌شده‌ها</button></div></form></div>';

    if (!$slice) echo '<div class="card"><p class="hint" style="margin:0">کتابی با این شرایط پیدا نشد.</p></div>';
    else {
        echo '<div class="tblwrap"><table class="tbl"><thead><tr><th style="width:34px"><input type="checkbox" id="selAll" aria-label="انتخاب همه‌ی این صفحه" style="margin:0"></th>'
           . '<th>کتاب</th><th>نویسنده</th><th>ژانر</th><th>قیمت (تومان)</th><th>صفحه</th><th></th></tr></thead><tbody>';
        foreach ($slice as $b) {
            $id = (string)($b['id'] ?? '');
            $single = author_is_single($authors, $b['authorId'] ?? '');
            echo '<tr><td class="c-chk"><input type="checkbox" class="rowchk" name="ids[]" value="' . e($id) . '" form="bulkForm" style="margin:0" aria-label="انتخاب"></td>'
               . '<td class="c-title"><b>' . e($b['title']['fa'] ?? '') . '</b>' . (!empty($b['isFamous']) ? ' <span class="tag hot">معروف</span>' : '') . (!empty($b['pdf']['file']) ? ' <span class="tag">PDF</span>' : ' <span class="tag no">بدون PDF</span>') . '<div class="hint ltr">' . e($b['title']['en'] ?? '') . '</div></td>'
               . '<td class="c-author">' . e($b['author']['fa'] ?? '') . '</td>'
               . '<td class="c-genre"><span class="tag">' . e($b['genre']['fa'] ?? ($GENRE_GROUPS[$b['genreGroup'] ?? ''] ?? '')) . '</span></td>'
               . '<td class="num c-price" data-l="قیمت (تومان)">' . number_format((int)($b['totalPrice'] ?? 0)) . '</td><td class="num c-pages" data-l="صفحه">' . (int)($b['pages'] ?? 0) . '</td><td class="c-acts"><div class="acts">'
               . '<a class="btn alt sm" href="admin.php?a=book_edit&id=' . urlencode($id) . '">ویرایش</a>';
            if (!$single) {
                echo '<form method="post" action="admin.php?a=book_dup"><input type="hidden" name="csrf" value="' . e(csrf_token()) . '"><input type="hidden" name="id" value="' . e($id) . '"><button class="btn alt sm" type="submit">تکثیر</button></form>'
                   . '<form method="post" action="admin.php?a=book_delete" onsubmit="return confirm(\'این کتاب حذف شود؟\')"><input type="hidden" name="csrf" value="' . e(csrf_token()) . '"><input type="hidden" name="id" value="' . e($id) . '"><button class="btn danger sm" type="submit">حذف</button></form>';
            } else {
                echo '<span class="tag no">تک‌کتابی</span>';
            }
            echo '</div></td></tr>';
        }
        echo '</tbody></table></div>';
    }
    echo paginate_html($total, $page, BOOKS_PER_PAGE);
    echo <<<'JS'
<script>(function(){
var bar=document.getElementById("bulkBar"),cnt=document.getElementById("bulkCount"),all=document.getElementById("selAll");
var chks=document.querySelectorAll(".rowchk");
function upd(){var n=0;for(var i=0;i<chks.length;i++)if(chks[i].checked)n++;cnt.textContent=n.toLocaleString("fa-IR");bar.className="bulkbar"+(n?" on":"");if(all)all.checked=n>0&&n===chks.length;}
for(var i=0;i<chks.length;i++)chks[i].addEventListener("change",upd);
Array.prototype.forEach.call(document.querySelectorAll("td.c-chk"),function(td){td.addEventListener("click",function(e){if(e.target===td){var k=td.querySelector("input");if(k)k.click();}});});
if(all)all.addEventListener("change",function(){for(var i=0;i<chks.length;i++)chks[i].checked=all.checked;upd();});
var ib=document.getElementById("impBtn"),f=document.getElementById("impFile");
ib.onclick=function(){f.click();};
f.onchange=function(){if(f.files&&f.files[0]&&confirm("فایل «"+f.files[0].name+"» وارد شود؟ کتاب‌های دارای id ویرایش می‌شوند (از فایل قبلی نسخه‌ی پشتیبان گرفته می‌شود).")){document.getElementById("impForm").submit();}else{f.value="";}};
})();</script>
JS;
}

// ---------- فرم ویرایش کتاب ----------
function content_book_edit() {
    global $GENRE_GROUPS;
    $books = read_books(); $authors = read_authors(); $byId = authors_by_id($authors);
    $id = gv('id');
    $isNew = ($id === 'new');
    $i = $isNew ? null : book_find_index($books, $id);
    $old = isset($_SESSION['old']) ? $_SESSION['old'] : null; unset($_SESSION['old']);
    if (!$isNew && $i === null) { echo '<div class="msg err">کتاب پیدا نشد.</div><a class="btn alt" href="admin.php?a=books">بازگشت</a>'; return; }
    $b = $isNew ? array('id' => 'new', 'category' => 'fiction') : $books[$i];
    $v = function ($pk, $stored = '') use ($old) {
        if ($old !== null) return isset($old[$pk]) && is_string($old[$pk]) ? $old[$pk] : '';
        return is_scalar($stored) ? (string)$stored : '';
    };
    $lockAuthor = author_is_single($byId, $b['authorId'] ?? '');
    page_head($isNew ? 'کتاب جدید' : 'ویرایش کتاب: ' . e($b['title']['fa'] ?? ''), '', '<a class="btn alt" href="admin.php?a=books">بازگشت به لیست</a>');
    echo '<form method="post" action="admin.php?a=book_save" enctype="multipart/form-data" data-draft="book:' . e($id) . '"><div class="formcard">'
       . '<input type="hidden" name="csrf" value="' . e(csrf_token()) . '"><input type="hidden" name="id" value="' . e($id) . '">';
    fs('نام و نویسنده');
    echo '<div class="row"><div><label>نام کتاب (فارسی)</label><input type="text" name="title_fa" required value="' . e($v('title_fa', $b['title']['fa'] ?? '')) . '"></div>'
       . '<div><label>نام کتاب (انگلیسی)</label><input type="text" class="ltr" name="title_en" value="' . e($v('title_en', $b['title']['en'] ?? '')) . '"></div></div>';
    $curSlug = $v('slug', $b['slug'] ?? '');
    echo '<label>آدرس صفحه‌ی کتاب (URL) <span class="hint">— اختیاری؛ فقط حروف انگلیسی کوچک، عدد و خط تیره. اگر خالی بماند خودکار از نام کتاب ساخته می‌شود (پیشنهاد: همین را خالی بگذار)</span></label>'
       . '<input type="text" class="ltr" name="slug" id="slugInput" placeholder="the-brothers-karamazov" maxlength="60" value="' . e($curSlug) . '">'
       . '<p class="hint ltr" id="slugPrev" style="margin-top:6px"></p>'
       . '<script>(function(){var i=document.getElementById("slugInput"),t=document.querySelector("input[name=title_en]"),p=document.getElementById("slugPrev");if(!i||!p)return;var id=' . json_encode((string)($isNew ? '(id)' : book_id_clean($b))) . ';function c(x){return x.toLowerCase().replace(/[\x27\u2018\u2019]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,60).replace(/-+$/,"");}var isNew=' . ($isNew ? 'true' : 'false') . ';var manual=i.value!=="";function u(){if(isNew&&!manual&&t){i.value=c(t.value);}var s=c(i.value)||c(t?t.value:"");p.textContent=s?("book-"+id+"-"+s+".html"):("book-"+id+"-(\u0627\u0632 \u0646\u0627\u0645 \u0641\u0627\u0631\u0633\u06cc \u0633\u0627\u062e\u062a\u0647 \u0645\u06cc\u200c\u0634\u0648\u062f).html");}i.addEventListener("input",function(){manual=i.value!=="";u();});if(t)t.addEventListener("input",u);u();})();</script>';
    $curA = $v('authorId', $b['authorId'] ?? '');
    echo '<label>نویسنده' . ($lockAuthor ? ' <span class="hint">— نویسنده‌ی تک‌کتابی قابل تغییر نیست</span>' : '') . '</label><select name="authorId"' . ($lockAuthor ? ' style="pointer-events:none;opacity:.7"' : '') . '>';
    foreach ($authors as $a) {
        $aid = $a['id'] ?? '';
        if ($lockAuthor && $aid !== ($b['authorId'] ?? '')) continue;
        if (!$lockAuthor && author_is_single($byId, $aid) && $aid !== ($b['authorId'] ?? '')) continue;
        echo '<option value="' . e($aid) . '"' . ($curA === $aid ? ' selected' : '') . '>' . e($a['name']['fa'] ?? $aid) . '</option>';
    }
    if ($curA === '' || !isset($byId[$curA])) echo '<option value="" selected>' . ($isNew ? '— یک نویسنده انتخاب کن —' : '— نویسنده‌ی این کتاب حذف شده؛ یک نویسنده انتخاب کن —') . '</option>';
    echo '</select>';
    fs('ژانر و دسته');
    $curG = $v('genreGroup', $b['genreGroup'] ?? ''); $curC = $v('category', $b['category'] ?? 'fiction');
    echo '<div class="row"><div><label>ژانر</label><select name="genreGroup">';
    foreach ($GENRE_GROUPS as $k => $l) echo '<option value="' . e($k) . '"' . ($curG === $k ? ' selected' : '') . '>' . e($l) . '</option>';
    echo '</select></div><div><label>دسته‌ی کتاب</label><select name="category">';
    foreach (book_cats() as $k => $l) echo '<option value="' . e($k) . '"' . ($curC === $k ? ' selected' : '') . '>' . e($l) . '</option>';
    echo '</select></div></div>';
    fs('قیمت و مشخصات');
    echo '<div class="row"><div><label>قیمت (تومان)</label><input type="text" name="totalPrice" inputmode="numeric" value="' . e($v('totalPrice', $b['totalPrice'] ?? '')) . '"></div>'
       . '<div><label>تعداد صفحه</label><input type="text" name="pages" inputmode="numeric" value="' . e($v('pages', $b['pages'] ?? '')) . '"></div></div>'
       . '<div class="row"><div><label>ناشر (فارسی)</label><input type="text" name="publisher_fa" value="' . e($v('publisher_fa', $b['publisher']['fa'] ?? '')) . '"></div>'
       . '<div><label>ناشر (انگلیسی)</label><input type="text" class="ltr" name="publisher_en" value="' . e($v('publisher_en', $b['publisher']['en'] ?? '')) . '"></div></div>'
       . '<div class="row"><div><label>مترجم (فارسی)</label><input type="text" name="translator_fa" value="' . e($v('translator_fa', $b['translator']['fa'] ?? '')) . '"></div>'
       . '<div><label>مترجم (انگلیسی)</label><input type="text" class="ltr" name="translator_en" value="' . e($v('translator_en', $b['translator']['en'] ?? '')) . '"></div></div>'
       . '<label style="font-weight:400;margin-top:14px"><input type="checkbox" name="isFamous" value="1"' . (($old !== null ? (isset($old['isFamous']) && $old['isFamous'] === '1') : !empty($b['isFamous'])) ? ' checked' : '') . '> کتاب معروف (در سایت برجسته می‌شود)</label>'
       . '<label style="font-weight:400;margin-top:8px"><input type="checkbox" name="newArrival" value="1"' . (($old !== null ? (isset($old['newArrival']) && $old['newArrival'] === '1') : !empty($b['newSeq'])) ? ' checked' : '') . '> ثبت به‌عنوان کتاب جدید (در بخش «جدیدترین‌ها»؛ فقط ۱۰۰ کتاب آخر نمایش داده می‌شود)</label>';
    fs('توضیح');
    echo '<label>توضیح (فارسی)</label><textarea name="desc_fa">' . e($v('desc_fa', $b['desc']['fa'] ?? '')) . '</textarea>'
       . '<label>توضیح (انگلیسی) <span class="hint">— اختیاری</span></label><textarea class="ltr" name="desc_en">' . e($v('desc_en', $b['desc']['en'] ?? '')) . '</textarea>';
    fs('بیوگرافی کتاب', 'متن بلند؛ اگر دست نزنی همین‌طور می‌ماند');
    echo '<label>بیوگرافی (فارسی)</label><textarea name="bio_fa" style="min-height:140px">' . e($v('bio_fa', $b['bio']['fa'] ?? '')) . '</textarea>'
       . '<label>بیوگرافی (انگلیسی) <span class="hint">— اختیاری</span></label><textarea class="ltr" name="bio_en" style="min-height:140px">' . e($v('bio_en', $b['bio']['en'] ?? '')) . '</textarea>';
    $bm = ($old !== null && isset($old['bio_empty'])) ? $old['bio_empty'] : 'desc';
    echo '<div id="bioEmptyBox" style="display:none;margin-top:12px;padding:12px 14px;border:1px dashed var(--b);border-radius:12px"><b>هر دو کادر بیوگرافی خالی است. بعد از ذخیره چه شود؟</b>'
       . '<label style="font-weight:400;display:block;margin-top:8px"><input type="radio" name="bio_empty" value="desc"' . ($bm === 'desc' ? ' checked' : '') . '> بیوگرافی پاک شود و «توضیح کوتاه» کتاب جایگزینش شود (پیشنهادی)</label>'
       . '<label style="font-weight:400;display:block"><input type="radio" name="bio_empty" value="empty"' . ($bm === 'empty' ? ' checked' : '') . '> بیوگرافی کاملاً خالی شود</label>'
       . '<label style="font-weight:400;display:block"><input type="radio" name="bio_empty" value="keep"' . ($bm === 'keep' ? ' checked' : '') . '> بیوگرافی قبلی همان‌طور بماند (تغییری نکند)</label></div>'
       . '<script>(function(){var f=document.querySelector(\'textarea[name=bio_fa]\'),e=document.querySelector(\'textarea[name=bio_en]\'),bx=document.getElementById("bioEmptyBox");if(!f||!e||!bx)return;function u(){bx.style.display=(f.value.trim()===""&&e.value.trim()==="")?"block":"none";}f.addEventListener("input",u);e.addEventListener("input",u);u();})();</script>';
    fs('عکس جلد کتاب', 'اختیاری؛ اگر آپلود نکنی، اسم کتاب روی یک جلد ساده نمایش داده می‌شود');
    $curCover = $isNew ? '' : book_cover_rel($b);
    if ($curCover !== '') echo '<p><img class="thumb" src="' . e($curCover) . '?v=' . (int)@filemtime(__DIR__ . '/' . $curCover) . '" alt=""> <span class="hint">عکس جلد فعلی؛ برای تعویض، عکس جدید انتخاب کن. بعد از ذخیره، در تمام سایت (صفحه‌ی کتاب، لیست کتاب‌ها، سبد خرید، ذخیره‌ها، صفحه‌ی نویسنده) عوض می‌شود.</span></p>'
       . '<label style="font-weight:400"><input type="checkbox" name="remove_cover" value="1"> حذف عکس جلد (برگشت به نمایش اسم کتاب)</label>';
    echo '<label>عکس جلد (JPG / PNG / WEBP)</label><input type="file" name="book_cover" accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp">';
    fs('فایل PDF', 'فایل کتاب برای فروش/دانلود');
    echo pdf_field_html($b, $id);
    fs_end();
    echo '</div><div class="actions"><button class="btn" type="submit">ذخیره</button><a class="btn alt" href="admin.php?a=books">انصراف</a></div></form>';
}

// ---------- لیست نویسنده‌ها (جایگزین لیست کارتی قبلی) ----------
function content_authors_list($authors) {
    global $GENRE_GROUPS;
    $books = read_books(); $counts = book_counts($books);
    $q = norm_txt(gv('q')); $fg = gv('genre'); $ff = gv('f'); $sort = gv('sort');
    $page = max(1, (int)gv('page'));

    $nNoPage = 0; $nNoPhoto = 0;
    $rows = array();
    foreach ($authors as $x) {
        $sl = $x['slug'] ?? '';
        $ph = !empty($x['photo']) ? $x['photo'] : ($sl ? find_photo($sl) : '');
        $hasPhoto = ($ph && file_exists(__DIR__ . '/' . $ph));
        if ($sl === '') $nNoPage++;
        if (!$hasPhoto) $nNoPhoto++;
        $x['_ph'] = $hasPhoto ? $ph : '';
        $x['_n'] = $counts[$x['id'] ?? ''] ?? 0;
        if ($fg !== '' && ($x['genreGroup'] ?? '') !== $fg) continue;
        if ($ff === 'nophoto' && $hasPhoto) continue;
        if ($ff === 'nopage' && $sl !== '') continue;
        if ($ff === 'single' && empty($x['singleBook'])) continue;
        if ($ff === 'alive' && !is_null($x['deathYear'] ?? null)) continue;
        if ($q !== '') {
            $hay = norm_txt(($x['name']['fa'] ?? '') . ' ' . ($x['name']['en'] ?? '') . ' ' . $sl . ' ' . ($x['nationality']['fa'] ?? ''));
            if (strpos($hay, $q) === false) continue;
        }
        $rows[] = $x;
    }
    $sorts = array('new' => 'جدیدترین', 'name' => 'نام فارسی', 'en' => 'نام انگلیسی', 'birth' => 'سال تولد', 'books' => 'بیشترین کتاب');
    if (!isset($sorts[$sort])) $sort = 'new';
    $num = function ($id) { return preg_match('/(\d+)$/', (string)$id, $m) ? (int)$m[1] : 0; };
    usort($rows, function ($x, $y) use ($sort, $num) {
        switch ($sort) {
            case 'name':  return cmp_text($x['name']['fa'] ?? '', $y['name']['fa'] ?? '');
            case 'en':    return cmp_text($x['name']['en'] ?? '', $y['name']['en'] ?? '');
            case 'birth': return ($x['birthYear'] ?? 0) <=> ($y['birthYear'] ?? 0);
            case 'books': return $y['_n'] <=> $x['_n'];
            default:      return $num($y['id'] ?? '') <=> $num($x['id'] ?? '');
        }
    });
    $total = count($rows);
    $pages = max(1, (int)ceil($total / AUTHORS_PER_PAGE));
    if ($page > $pages) $page = $pages;
    $slice = array_slice($rows, ($page - 1) * AUTHORS_PER_PAGE, AUTHORS_PER_PAGE);

    echo content_css();
    page_head('نویسنده‌ها', 'افزودن، ویرایش و حذف نویسنده‌های فروشگاه',
        '<div class="qa" style="margin:0"><a class="btn alt" href="admin.php?a=authors_csv">خروجی CSV</a><a class="btn" href="admin.php?a=new">' . icon('plus') . 'نویسنده‌ی جدید</a></div>');
    echo '<div class="stats"><div class="stat"><b>' . count($authors) . '</b><span>نویسنده</span></div>'
       . '<div class="stat"><b>' . count($books) . '</b><span>کتاب</span></div>'
       . '<div class="stat' . ($nNoPhoto ? ' warn' : '') . '"><b>' . $nNoPhoto . '</b><span>بدون عکس</span></div>'
       . '<div class="stat' . ($nNoPage ? ' warn' : '') . '"><b>' . $nNoPage . '</b><span>بدون صفحه‌ی جدا</span></div></div>';

    echo '<form class="tools" method="get" action="admin.php"><input type="hidden" name="a" value="list">'
       . '<input type="text" name="q" value="' . e(gv('q')) . '" placeholder="جستجو در نام، آدرس (slug) یا ملیت…"><select name="genre"><option value="">همه‌ی ژانرها</option>';
    foreach ($GENRE_GROUPS as $k => $l) echo '<option value="' . e($k) . '"' . ($fg === $k ? ' selected' : '') . '>' . e($l) . '</option>';
    echo '</select><select name="f"><option value="">همه</option>';
    foreach (array('nophoto' => 'بدون عکس', 'nopage' => 'بدون صفحه‌ی جدا', 'single' => 'تک‌کتابی', 'alive' => 'زنده') as $k => $l) echo '<option value="' . $k . '"' . ($ff === $k ? ' selected' : '') . '>' . $l . '</option>';
    echo '</select><select name="sort">';
    foreach ($sorts as $k => $l) echo '<option value="' . $k . '"' . ($sort === $k ? ' selected' : '') . '>' . $l . '</option>';
    echo '</select><button class="btn" type="submit">اعمال</button>';
    if ($q !== '' || $fg !== '' || $ff !== '' || gv('sort') !== '') echo '<a class="btn alt" href="admin.php?a=list">پاک‌کردن</a>';
    echo '</form><p class="resultinfo">' . $total . ' نویسنده از ' . count($authors) . ($pages > 1 ? ' — صفحه‌ی ' . $page . ' از ' . $pages : '') . '</p>';

    if (!$slice) echo '<div class="card"><p class="hint" style="margin:0">نویسنده‌ای با این شرایط پیدا نشد.</p></div>';
    echo '<div class="shelf">';
    foreach ($slice as $x) {
        $slug = $x['slug'] ?? ''; $n = $x['_n'];
        echo '<article class="ac">';
        if ($x['_ph']) echo '<img class="pic" src="' . e($x['_ph']) . '" alt="' . e($x['name']['fa'] ?? '') . '" loading="lazy">';
        else echo '<div class="nopic"><span>' . e($x['avatarEmoji'] ?? '📖') . '</span><span>بدون عکس</span></div>';
        echo '<div class="body"><div class="nm">' . e($x['name']['fa'] ?? '') . '</div><div class="en">' . e($x['name']['en'] ?? '') . '</div><div class="meta">'
           . '<span class="tag">' . $n . ' کتاب</span>' . (!empty($x['singleBook']) ? '<span class="tag">تک‌کتابی</span>' : '') . '</div>';
        echo $slug ? '<div class="pg"><a class="pl" href="author-' . e($slug) . '.html" target="_blank" rel="opener" title="author-' . e($slug) . '.html">' . icon('link') . '<span>صفحه فارسی</span></a><a class="pl" href="en-author-' . e($slug) . '.html" target="_blank" rel="opener" title="en-author-' . e($slug) . '.html">' . icon('link') . '<span class="en-tag">English</span></a></div>'
                   : '<div class="meta"><span class="tag no">فقط پنجره (بدون صفحه)</span></div>';
        echo '</div><div class="acts"><a class="btn alt sm" href="admin.php?a=edit&id=' . urlencode($x['id'] ?? '') . '">ویرایش</a>';
        echo '<a class="btn alt sm" href="admin.php?a=books&author=' . urlencode($x['id'] ?? '') . '">کتاب‌ها</a>';
        echo '<form method="post" action="admin.php?a=delete" onsubmit="return confirm(\'حذف «' . e(addslashes($x['name']['fa'] ?? '')) . '»؟' . ($n ? ' ' . $n . ' کتاب به این نویسنده وصل است.' : '') . '\')">'
           . '<input type="hidden" name="csrf" value="' . e(csrf_token()) . '"><input type="hidden" name="id" value="' . e($x['id'] ?? '') . '"><button class="btn danger sm" type="submit">حذف</button></form></div></article>';
    }
    echo '</div>' . paginate_html($total, $page, AUTHORS_PER_PAGE);
}
