#!/bin/sh
# هر چهار فایل داخل assets/ را از روی فایل‌های همین پوشه می‌سازد.
# فقط فایل‌های همین پوشه (assets-src) را ویرایش کنید، بعد این را اجرا کنید.
cd "$(dirname "$0")" || exit 1
esbuild app-index.js  --minify-whitespace --minify-syntax --charset=utf8 --outfile=../assets/app-index.js  || exit 1
esbuild app-author.js --minify-whitespace --minify-syntax --charset=utf8 --outfile=../assets/app-author.js || exit 1
esbuild index.css     --minify --charset=utf8 --outfile=../assets/index.css  || exit 1
esbuild author.css    --minify --charset=utf8 --outfile=../assets/author.css || exit 1
echo "ساخته شد: assets/ از روی assets-src به‌روز است."
