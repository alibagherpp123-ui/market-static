#!/bin/sh
# بررسی می‌کند فایل‌های assets/ دقیقاً همان چیزی باشند که از روی assets-src ساخته می‌شود.
# اگر یکی فرق داشت یعنی کسی مستقیم روی assets/ ویرایش کرده (و با ساخت بعدی از بین می‌رود).
cd "$(dirname "$0")" || exit 1
T=$(mktemp -d) || exit 1
esbuild app-index.js  --minify-whitespace --minify-syntax --charset=utf8 --outfile="$T/app-index.js"  --log-level=error
esbuild app-author.js --minify-whitespace --minify-syntax --charset=utf8 --outfile="$T/app-author.js" --log-level=error
esbuild index.css     --minify --charset=utf8 --outfile="$T/index.css"  --log-level=error
esbuild author.css    --minify --charset=utf8 --outfile="$T/author.css" --log-level=error
bad=0
for f in app-index.js app-author.js index.css author.css; do
  if cmp -s "$T/$f" "../assets/$f"; then echo "هماهنگ: $f"; else echo "فرق دارد: $f"; bad=1; fi
done
rm -rf "$T"
node check-contest-sync.js || bad=1
[ $bad -eq 0 ] && echo "همه‌چیز هماهنگ است." || echo "تغییر مستقیم در assets/ پیدا شد؛ اول آن را به assets-src منتقل کنید."
exit $bad
