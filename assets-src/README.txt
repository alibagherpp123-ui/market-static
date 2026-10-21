فایل‌های اصلی (خوانا) اینجاست. فایل‌های داخل assets/ نسخه‌ی فشرده‌شده‌اند.
هر تغییری در js/css دادی، روی فایل همین پوشه بده و دوباره فشرده کن:
  esbuild app-index.js  --minify-whitespace --minify-syntax --charset=utf8 --outfile=../assets/app-index.js
  esbuild app-author.js --minify-whitespace --minify-syntax --charset=utf8 --outfile=../assets/app-author.js
  esbuild index.css  --minify --charset=utf8 --outfile=../assets/index.css
  esbuild author.css --minify --charset=utf8 --outfile=../assets/author.css
originals/ : عکس اصلیِ نویسنده قبل از کوچک‌سازی
عکس‌های اصلی آواتار (png) هنوز کنار فایل‌های webp در images/avatars هستن (پنل ادمین از png استفاده می‌کنه).

ساخت و بررسی (جدید):
  sh build.sh        ← هر چهار فایل assets/ را از روی همین پوشه می‌سازد
  sh check-sync.sh   ← بررسی می‌کند assets/ دقیقاً همان چیزی باشد که از این پوشه ساخته می‌شود
قانون: هیچ‌وقت مستقیم روی assets/ ویرایش نکنید؛ فقط همین پوشه را ویرایش کنید و build.sh را بزنید.
