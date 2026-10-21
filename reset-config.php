<?php
// ============================================================
// تنظیمات بازیابی رمز (فقط روی سرور؛ از بیرون بسته است — .htaccess)
// ============================================================
define('SUPABASE_URL', 'https://rpvpzhyxngxqztjcwcss.supabase.co');

// کلید «service_role» (یا Secret key) پروژه‌ی Supabase:
// Supabase → Project Settings → API Keys. این کلید را هیچ‌جای دیگری (مرورگر/گیت) نگذار.
define('SUPABASE_SERVICE_KEY', 'PUT_YOUR_SERVICE_ROLE_KEY_HERE');

// یک متن تصادفی طولانی (فقط برای امضای کدها)؛ یک‌بار عوضش کن
define('OTP_SECRET', 'CHANGE_ME_TO_A_LONG_RANDOM_STRING');

// حالت تست: true = کد روی همان صفحه نمایش داده می‌شود (مثل قبل، بدون پیامک واقعی)
// وقتی پنل پیامک وصل شد حتماً false کن؛ وگرنه کد در اختیار هر کسی قرار می‌گیرد.
define('SMS_TEST_MODE', true);

define('OTP_TTL_SECONDS', 300);     // اعتبار کد: ۵ دقیقه
define('OTP_RESEND_SECONDS', 30);   // فاصله‌ی دو بار ارسال کد برای یک شماره
define('OTP_MAX_TRIES', 5);         // حداکثر تلاش اشتباه برای هر کد
