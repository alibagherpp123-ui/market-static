<?php
// Shared storage helpers. Loaded only by the admin controller.
if (!function_exists('csrf_token')) { http_response_code(404); exit; }

// Hold the lock for the entire POST, including its read/modify/write phase.
function content_write_lock() {
    if (isset($GLOBALS['CONTENT_WRITE_LOCK'])) return true;
    $lock = @fopen(__DIR__ . '/data/.content-write.lock', 'c');
    if (!$lock || !flock($lock, LOCK_EX)) {
        if ($lock) fclose($lock);
        return 'قفل ذخیره‌سازی ساخته نشد؛ دسترسی نوشتن پوشه‌ی data را بررسی کن.';
    }
    $GLOBALS['CONTENT_WRITE_LOCK'] = $lock;
    return true;
}

function storage_cleanup_staged($staged) {
    foreach ($staged as $entry) {
        if (!empty($entry['tmp'])) @unlink($entry['tmp']);
        if (!empty($entry['undo'])) @unlink($entry['undo']);
    }
}

// Prepare ALL files before replacing any. Keep on-disk undo copies until the
// entire batch succeeds; on a replacement failure restore the previous bytes.
// $writes: absolute path => array('kind' => backup prefix, 'data' => JSON data).
function save_content_batch($writes) {
    $r = content_write_lock();
    if ($r !== true) return $r;
    $staged = array();
    foreach ($writes as $path => $entry) {
        $json = json_encode($entry['data'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        if ($json === false) { storage_cleanup_staged($staged); return 'خطا در ساخت JSON: ' . json_last_error_msg(); }
        if (file_exists($path) && !is_file($path)) { storage_cleanup_staged($staged); return 'مسیر فایل داده نامعتبر است: ' . basename($path); }
        $old = is_file($path) ? @file_get_contents($path) : null;
        if ($old === false) { storage_cleanup_staged($staged); return 'خواندن فایل قبلی ممکن نشد: ' . basename($path); }
        // A pre-existing .tmp directory is a storage error, not something to overwrite.
        if (is_dir($path . '.tmp')) { storage_cleanup_staged($staged); return 'مسیر فایل موقت قابل نوشتن نیست: ' . basename($path); }
        $tmp = @tempnam(dirname($path), '.save-');
        $undo = $old !== null ? @tempnam(dirname($path), '.undo-') : null;
        $staged[$path] = array('tmp' => $tmp, 'undo' => $undo, 'old' => $old, 'entry' => $entry);
        if (!$tmp || realpath(dirname($tmp)) !== realpath(dirname($path))
            || ($old !== null && (!$undo || realpath(dirname($undo)) !== realpath(dirname($path))))
            || @file_put_contents($tmp, $json, LOCK_EX) !== strlen($json)
            || ($old !== null && @file_put_contents($undo, $old, LOCK_EX) !== strlen($old))) {
            storage_cleanup_staged($staged); return 'آماده‌سازی فایل ممکن نشد؛ هیچ اطلاعاتی ذخیره نشد: ' . basename($path);
        }
        $mode = is_file($path) ? (fileperms($path) & 0777) : 0644;
        @chmod($tmp, $mode);
        if ($undo) @chmod($undo, $mode);
    }
    if (!is_dir(BACKUP_DIR) && !@mkdir(BACKUP_DIR, 0755, true)) {
        storage_cleanup_staged($staged); return 'ساخت پوشه‌ی پشتیبان ممکن نشد؛ چیزی ذخیره نشد.';
    }
    foreach ($staged as $path => $s) {
        if ($s['old'] === null) continue;
        $bkp = BACKUP_DIR . '/' . $s['entry']['kind'] . '-' . date('Ymd-His') . '.json';
        if (!file_exists($bkp) && !@copy($s['undo'], $bkp)) {
            storage_cleanup_staged($staged); return 'ساخت پشتیبان ممکن نشد؛ چیزی ذخیره نشد.';
        }
    }
    $done = array();
    foreach ($staged as $path => $s) {
        if (!@rename($s['tmp'], $path)) {
            $failedRestore = array();
            foreach (array_reverse($done) as $changed) {
                $u = $staged[$changed];
                $ok = $u['old'] === null ? @unlink($changed) : @rename($u['undo'], $changed);
                if (!$ok) $failedRestore[] = $changed;
            }
            if ($failedRestore) {
                // Preserve undo files rather than destroying the only recovery copy.
                foreach ($staged as $u) if ($u['tmp']) @unlink($u['tmp']);
                error_log('Content rollback failed: ' . implode(', ', $failedRestore));
                return 'خطای دیسک در بازگردانی؛ نسخه‌های بازیابی .undo- در data حفظ شدند. پیش از ادامه، فایل‌ها را بازیابی کن.';
            }
            storage_cleanup_staged($staged);
            return 'ذخیره ناموفق بود؛ اطلاعات به حالت قبل برگشت: ' . basename($path);
        }
        $done[] = $path;
    }
    foreach ($staged as $path => $s) {
        $oldData = $s['old'] !== null ? json_decode(ltrim($s['old'], "\xEF\xBB\xBF"), true) : null;
        log_change($s['entry']['kind'], $oldData, $s['entry']['data']);
        $backups = glob(BACKUP_DIR . '/' . $s['entry']['kind'] . '-*.json');
        if ($backups && count($backups) > 30) {
            sort($backups);
            foreach (array_slice($backups, 0, count($backups) - 30) as $file) @unlink($file);
        }
    }
    storage_cleanup_staged($staged);
    return true;
}

// File deletion is deferred until the corresponding JSON batch has succeeded.
function pdf_defer_delete($book) {
    $path = pdf_path($book);
    if ($path) $GLOBALS['PDF_OLD_PENDING'][$path] = true;
}
function pdf_track_new($path) { $GLOBALS['PDF_NEW_PENDING'][$path] = true; }
function pdf_finish_changes($success) {
    $key = $success ? 'PDF_OLD_PENDING' : 'PDF_NEW_PENDING';
    foreach (isset($GLOBALS[$key]) ? $GLOBALS[$key] : array() as $path => $unused) @unlink($path);
    unset($GLOBALS['PDF_OLD_PENDING'], $GLOBALS['PDF_NEW_PENDING']);
}
register_shutdown_function(function () {
    pdf_finish_changes(false);
    if (isset($GLOBALS['CONTENT_WRITE_LOCK'])) {
        flock($GLOBALS['CONTENT_WRITE_LOCK'], LOCK_UN);
        fclose($GLOBALS['CONTENT_WRITE_LOCK']);
        unset($GLOBALS['CONTENT_WRITE_LOCK']);
    }
});