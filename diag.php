<?php
// صفحه‌ی تشخیص موقت — فقط برای تست روی گوشی. قبل از انتشار سایت این فایل را پاک کن.
header('Content-Type: text/html; charset=utf-8');
header('Cache-Control: no-store');
$srv = array();
$srv['PHP'] = PHP_VERSION . ' / ' . PHP_SAPI;
$srv['curl'] = function_exists('curl_init') ? 'هست' : 'نیست';
$srv['openssl'] = extension_loaded('openssl') ? 'هست' : 'نیست';
$srv['allow_url_fopen'] = ini_get('allow_url_fopen') ? 'روشن' : 'خاموش';
$srv['upload_max_filesize'] = ini_get('upload_max_filesize');
$srv['data/pdfs خواندنی'] = is_readable(__DIR__ . '/data/pdfs') ? 'بله' : 'نه';
$srv['فایل PDF نمونه'] = is_file(__DIR__ . '/data/pdfs/b19-e5252fe216b7.pdf') ? 'هست (' . filesize(__DIR__ . '/data/pdfs/b19-e5252fe216b7.pdf') . ' بایت)' : 'نیست';
$srv['images/avatars/Ken.webp'] = is_file(__DIR__ . '/images/avatars/Ken.webp') ? 'روی دیسک هست' : 'روی دیسک نیست';
$srv['temp dir نوشتنی'] = is_writable(sys_get_temp_dir()) ? 'بله' : 'نه';
// آیا خودِ سرور می‌تواند به Supabase وصل شود؟ (read-pdf.php همین کار را می‌کند)
$t0 = microtime(true);
$url = 'https://rpvpzhyxngxqztjcwcss.supabase.co/auth/v1/health';
$res = 'curl/openssl نیست';
if (function_exists('curl_init')) {
    $ch = curl_init($url);
    curl_setopt_array($ch, array(CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 8, CURLOPT_HTTPHEADER => array('apikey: sb_publishable_ABJrLcMuFU-OSB0_BHWrRw_cNufmDC0')));
    $b = curl_exec($ch);
    $res = $b === false ? ('خطا: ' . curl_error($ch)) : ('HTTP ' . curl_getinfo($ch, CURLINFO_HTTP_CODE));
    curl_close($ch);
}
$srv['اتصال سرور به Supabase'] = $res . ' (' . round((microtime(true) - $t0) * 1000) . ' ms)';
?><!doctype html>
<html lang="fa" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>diag</title>
<style>body{font:14px/1.7 system-ui,sans-serif;margin:12px;background:#111;color:#eee}h2{font-size:15px;margin:16px 0 4px;color:#ffb36b}
.r{padding:4px 8px;border-radius:6px;margin:3px 0;background:#1d1d1d;word-break:break-all}.ok{border-right:4px solid #3c9}.bad{border-right:4px solid #e55}.wait{border-right:4px solid #888}
img{width:48px;height:64px;object-fit:cover;border-radius:8px;vertical-align:middle;background:#333}code{direction:ltr;unicode-bidi:embed}</style></head><body>
<h1 style="font-size:17px">تشخیص (diag.php)</h1>
<h2>سرور</h2>
<?php foreach ($srv as $k => $v) echo '<div class="r">' . htmlspecialchars($k) . ': <b>' . htmlspecialchars($v) . '</b></div>'; ?>
<h2>مرورگر</h2><div id="env"></div>
<h2>آواتار</h2><div id="av"></div>
<h2>فایل‌ها و سرور</h2><div id="net"></div>
<script>
function add(id, ok, text){var d=document.createElement('div');d.className='r '+(ok===null?'wait':ok?'ok':'bad');d.innerHTML=text;document.getElementById(id).appendChild(d);return d;}
function T(p,ms){return Promise.race([p,new Promise(function(_,j){setTimeout(function(){j(new Error('timeout '+ms+'ms'))},ms)})]);}
add('env',true,'آدرس صفحه: <code>'+location.href+'</code>');
add('env',window.isSecureContext,'isSecureContext: <b>'+window.isSecureContext+'</b> (روی http با آی‌پی معمولاً false است)');
add('env',!!navigator.locks,'navigator.locks: <b>'+!!navigator.locks+'</b>');
add('env',typeof Promise.withResolvers==='function','Promise.withResolvers: <b>'+(typeof Promise.withResolvers)+'</b>');
add('env',null,'UA: <code>'+navigator.userAgent+'</code>');
['Ken.webp','Ken.png','Ryu.webp'].forEach(function(n){
  var d=add('av',null,n+' ← ');var im=new Image();im.width=48;
  im.onload=function(){d.className='r ok';d.innerHTML+=' لود شد ('+im.naturalWidth+'×'+im.naturalHeight+') ';d.appendChild(im);};
  im.onerror=function(){d.className='r bad';d.innerHTML+=' لود نشد (Ryu.webp عمداً وجود ندارد و باید با SVG جایگزین شود)';};
  im.src='images/avatars/'+n+'?t='+Date.now();
});
var sc=document.createElement('script');sc.src='images/avatars/avatar-svgs.js?t='+Date.now();
sc.onload=function(){add('av',!!window.AVATAR_SVG,'avatar-svgs.js لود شد؛ تعداد آواتار SVG: <b>'+Object.keys(window.AVATAR_SVG||{}).length+'</b>');};
sc.onerror=function(){add('av',false,'avatar-svgs.js لود نشد');};document.head.appendChild(sc);
function chk(url,label,opt){
  T(fetch(url+(url.indexOf('?')<0?'?':'&')+'t='+Date.now(),opt||{}),15000).then(function(r){
    return r.clone().arrayBuffer().then(function(b){add('net',r.ok||(opt&&opt.expect===r.status),label+': HTTP <b>'+r.status+'</b> | '+(r.headers.get('content-type')||'?')+' | '+b.byteLength+' بایت'+(b.byteLength<300?' | <code>'+new TextDecoder().decode(b).replace(/</g,'&lt;')+'</code>':''));});
  }).catch(function(e){add('net',false,label+': خطا — '+e.message);});
}
chk('images/avatars/Ken.webp','Ken.webp');
chk('assets/pdfjs/pdf.js','pdf.js');
chk('assets/pdfjs/pdf.worker.js','pdf.worker.js');
chk('assets/pdfjs/secure-reader.js?v=16','secure-reader.js');
chk('read-pdf.php?id=19','read-pdf.php بدون توکن (انتظار: 401 با پیام فارسی)',{expect:401});
T(fetch('https://rpvpzhyxngxqztjcwcss.supabase.co/auth/v1/health',{mode:'no-cors'}),10000)
 .then(function(){add('net',true,'مرورگر گوشی به Supabase می‌رسد');})
 .catch(function(e){add('net',false,'مرورگر گوشی به Supabase نمی‌رسد: '+e.message);});
</script></body></html>
