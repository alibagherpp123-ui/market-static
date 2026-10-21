<?php
// ============================================================
// بازخورد بهتر در فرم‌ها (بخش ۴)
//   • پیام موفقیت/خطا به‌صورت toast (به‌جای نوار بالای صفحه)
//   • پیش‌نمایش عکس قبل از آپلود (با بررسی نوع و حجم)
//   • ذخیره‌ی خودکار پیش‌نویس فرم‌ها + هشدار خروج با تغییرات ذخیره‌نشده
//   • میانبر کیبورد: Ctrl+S (در مک ⌘+S) ذخیره، «/» رفتن به جستجو
// فرم‌ها با ویژگی data-draft="کلید" فعال می‌شوند. فقط از admin.php لود می‌شود.
// ============================================================
if (!function_exists('csrf_token')) { http_response_code(404); exit; }

function feedback_css() {
    return '.toasts{position:fixed;top:16px;left:50%;transform:translateX(-50%);z-index:200;display:flex;flex-direction:column;gap:10px;width:min(460px,calc(100vw - 24px));pointer-events:none}'
        . '.toast{pointer-events:auto;display:flex;gap:10px;align-items:flex-start;background:var(--card);color:var(--t);border:1px solid var(--b);border-right:5px solid var(--m);border-radius:12px;padding:12px 14px;box-shadow:0 12px 34px rgba(20,24,33,.28);animation:tin .22s ease-out;font-size:.9rem;line-height:1.7}'
        . '.toast.ok{border-right-color:#1f9d57}.toast.err{border-right-color:#d92d20}.toast.info{border-right-color:#2f6fdd}'
        . '.toast .tx{flex:1;min-width:0;white-space:pre-line;word-break:break-word}.toast .tx div+div{margin-top:2px}'
        . '.toast .tic{font-size:1.1rem;line-height:1.5}.toast button{background:none;border:0;color:var(--m);font:inherit;font-size:1.2rem;line-height:1;cursor:pointer;padding:2px 4px}.toast button:hover{color:var(--t)}'
        . '.toast.out{opacity:0;transform:translateY(-8px);transition:opacity .2s,transform .2s}'
        . '@keyframes tin{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:none}}'
        . '@media(max-width:760px){.toasts{top:10px}}'
        . '@media(prefers-reduced-motion:reduce){.toast{animation:none}}'
        . '.photo-prev{display:none;gap:12px;align-items:center;margin-top:10px;padding:10px;border:1px dashed var(--b);border-radius:12px}.photo-prev.on{display:flex}'
        . '.photo-prev img{width:90px;height:120px;object-fit:cover;border-radius:8px;background:rgba(128,128,128,.2);flex-shrink:0}'
        . '.photo-prev .pi{flex:1;min-width:0;font-size:.84rem}.photo-prev .pi b{display:block;word-break:break-all}.photo-prev .pi .warn{color:#b45309}'
        . '.draftbar{display:flex;gap:10px;align-items:center;flex-wrap:wrap;background:rgba(47,111,221,.1);border:1px solid rgba(47,111,221,.4);border-radius:12px;padding:10px 14px;margin-bottom:16px;font-size:.88rem}.draftbar .grow{flex:1;min-width:180px}'
        . '.dstat{color:var(--m);font-size:.78rem;margin-right:auto;align-self:center}.dstat.dirty{color:#b45309}'
        . '.chunk-prog{display:none;margin-top:8px}.chunk-prog.on{display:block}'
        . '.cp-bar{height:8px;border-radius:6px;background:rgba(128,128,128,.25);overflow:hidden}.cp-bar i{display:block;height:100%;width:0;background:var(--p);transition:width .15s}'
        . '.cp-tx{display:block;font-size:.8rem;color:var(--m);margin-top:4px}.cp-tx.err{color:#d92d20}.cp-tx.ok{color:#17803d}'
        . 'kbd{font:inherit;font-size:.72rem;border:1px solid var(--b);border-bottom-width:2px;border-radius:6px;padding:0 6px;background:var(--inp);color:var(--m)}@media(pointer:coarse){kbd{display:none}}';
}

// پیام flash را به toast تبدیل می‌کند (در صورت خاموش بودن جاوااسکریپت، نمایش ساده)
function toast_flash_html($flash) {
    $type = ($flash[0] === 'ok') ? 'ok' : 'err';
    return '<script>window.__ADM_FLASH=' . json_encode(array($type, (string)$flash[1]), JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP) . ';</script>'
        . '<noscript><div class="msg ' . e($type) . '">' . e($flash[1]) . '</div></noscript>';
}

function feedback_js() {
    $js = <<<'JS'
(function(){
"use strict";
var host=document.getElementById("admToasts");
function fa(n){try{return Number(n).toLocaleString("fa-IR");}catch(e){return n;}}

/* ---------- toast ---------- */
window.admToast=function(type,text,ms){
  if(!host)return;
  type=(type==="ok"||type==="err"||type==="info")?type:"info";
  var t=document.createElement("div");t.className="toast "+type;t.setAttribute("role",type==="err"?"alert":"status");
  var ic=document.createElement("span");ic.className="tic";ic.textContent=type==="ok"?"✅":(type==="err"?"⚠️":"ℹ️");
  var tx=document.createElement("div");tx.className="tx";
  String(text||"").split("\n").forEach(function(l){if(l.trim()===""&&tx.childNodes.length===0)return;var d=document.createElement("div");d.textContent=l;tx.appendChild(d);});
  var x=document.createElement("button");x.type="button";x.setAttribute("aria-label","بستن");x.textContent="×";
  t.appendChild(ic);t.appendChild(tx);t.appendChild(x);host.appendChild(t);
  var timer=null;
  function close(){if(timer)clearTimeout(timer);t.classList.add("out");setTimeout(function(){if(t.parentNode)t.parentNode.removeChild(t);},220);}
  x.onclick=close;
  function arm(){var d=ms||(type==="err"?12000:(String(text).length>120?9000:5000));timer=setTimeout(close,d);}
  arm();
  t.addEventListener("mouseenter",function(){if(timer)clearTimeout(timer);});
  t.addEventListener("mouseleave",arm);
  while(host.children.length>4)host.removeChild(host.firstChild);
  return t;
};

/* ---------- پیام flash سرور ---------- */
var flash=window.__ADM_FLASH||null;
if(flash)window.admToast(flash[0],flash[1]);

/* ---------- فرم‌های دارای پیش‌نویس ---------- */
var SUBMIT_KEY="adm_submitted_form";
var submittedKey=null;try{submittedKey=sessionStorage.getItem(SUBMIT_KEY);sessionStorage.removeItem(SUBMIT_KEY);}catch(e){}
var forms=document.querySelectorAll("form[data-draft]");
var allDirty=[];

function fields(form){
  var out=[],els=form.elements;
  for(var i=0;i<els.length;i++){
    var el=els[i],n=el.name,tp=(el.type||"").toLowerCase();
    if(!n||el.disabled||n==="csrf"||n==="edit_id"||n==="id"||tp==="file"||tp==="submit"||tp==="button"||tp==="password"||tp==="hidden")continue;
    out.push(el);
  }
  return out;
}
function snapshot(form){
  var o={};
  fields(form).forEach(function(el){
    var tp=(el.type||"").toLowerCase();
    if(tp==="checkbox"||tp==="radio"){if(el.checked)o[el.name]=el.value;else if(!(el.name in o))o[el.name]="";}
    else o[el.name]=el.value;
  });
  return o;
}
function same(a,b){var k=Object.keys(a).concat(Object.keys(b));for(var i=0;i<k.length;i++){if((a[k[i]]||"")!==(b[k[i]]||""))return false;}return true;}
function apply(form,snap){
  fields(form).forEach(function(el){
    if(!(el.name in snap))return;
    var tp=(el.type||"").toLowerCase(),v=snap[el.name]||"";
    if(tp==="checkbox"||tp==="radio")el.checked=(v!==""&&v===el.value);
    else el.value=v;
    el.dispatchEvent(new Event("input",{bubbles:true}));el.dispatchEvent(new Event("change",{bubbles:true}));
  });
}

Array.prototype.forEach.call(forms,function(form){
  var key="adm_draft:"+form.getAttribute("data-draft"),initial=snapshot(form),submitting=false,timer=null;
  var stat=document.createElement("span");stat.className="dstat";
  var bar=form.querySelector(".actions");if(bar)bar.appendChild(stat);

  function readDraft(){try{var d=JSON.parse(localStorage.getItem(key)||"null");if(d&&d.v&&typeof d.v==="object"&&(Date.now()-d.t)<30*864e5)return d;}catch(e){}return null;}
  function writeDraft(){try{localStorage.setItem(key,JSON.stringify({t:Date.now(),v:snapshot(form)}));return true;}catch(e){return false;}}
  function clearDraft(){try{localStorage.removeItem(key);}catch(e){}}
  function dirty(){return !same(snapshot(form),initial);}
  function mark(){
    if(dirty()){stat.className="dstat dirty";stat.textContent="تغییرات ذخیره‌نشده";}
    else{stat.className="dstat";stat.textContent="";}
  }

  /* نتیجه‌ی ذخیره‌ی قبلی همین فرم */
  var mine=(submittedKey===key);
  if(mine&&flash&&flash[0]==="ok")clearDraft();
  else if(mine&&flash&&flash[0]==="err"){writeDraft();}   // خطای اعتبارسنجی: مقدار فرم را در پیش‌نویس نگه دار

  /* پیشنهاد بازیابی پیش‌نویس */
  var d=readDraft();
  if(d&&!(mine&&flash&&flash[0]==="err")&&!same(d.v,initial)){
    var b=document.createElement("div");b.className="draftbar";
    var tx=document.createElement("div");tx.className="grow";
    tx.textContent="پیش‌نویس ذخیره‌نشده‌ای از "+new Date(d.t).toLocaleString("fa-IR")+" پیدا شد.";
    var r=document.createElement("button");r.type="button";r.className="btn sm";r.textContent="بازیابی";
    var x=document.createElement("button");x.type="button";x.className="btn alt sm";x.textContent="حذف پیش‌نویس";
    r.onclick=function(){apply(form,d.v);b.remove();mark();window.admToast("info","پیش‌نویس بازیابی شد. برای ثبت نهایی «ذخیره» را بزن.");};
    x.onclick=function(){clearDraft();b.remove();};
    b.appendChild(tx);b.appendChild(r);b.appendChild(x);form.insertBefore(b,form.firstChild);
  }

  /* ذخیره‌ی خودکار */
  var warned=false;
  function onChange(){
    mark();
    if(timer)clearTimeout(timer);
    timer=setTimeout(function(){
      if(!dirty()){clearDraft();return;}
      if(writeDraft()){stat.className="dstat";stat.textContent="پیش‌نویس ذخیره شد "+new Date().toLocaleTimeString("fa-IR",{hour:"2-digit",minute:"2-digit"});}
      else if(!warned){warned=true;window.admToast("err","ذخیره‌ی خودکار پیش‌نویس ممکن نشد (حافظه‌ی مرورگر).");}
    },700);
  }
  form.addEventListener("input",onChange);form.addEventListener("change",onChange);

  /* هشدار خروج */
  form.addEventListener("submit",function(){
    submitting=true;
    try{sessionStorage.setItem(SUBMIT_KEY,key);}catch(e){}
    setTimeout(function(){submitting=false;},4000);   // اگر اعتبارسنجی مرورگر مانع شد، هشدار دوباره فعال شود
  });
  allDirty.push(function(){return !submitting&&dirty();});
  form.__admSubmit=function(){
    if(typeof form.reportValidity==="function"&&!form.reportValidity()){window.admToast("err","بعضی فیلدهای لازم پر نشده‌اند.");return;}
    if(typeof form.requestSubmit==="function")form.requestSubmit();else form.submit();
  };
});
window.addEventListener("beforeunload",function(e){
  for(var i=0;i<allDirty.length;i++){if(allDirty[i]()){e.preventDefault();e.returnValue="";return "";}}
});

/* ---------- آپلود تکه‌تکه (بدون وابستگی به محدودیت حجم سرور) ---------- */
function admToken(){var a=new Uint8Array(12),i;if(window.crypto&&window.crypto.getRandomValues)window.crypto.getRandomValues(a);else for(i=0;i<12;i++)a[i]=Math.floor(Math.random()*256);return Array.prototype.map.call(a,function(b){return(b<16?"0":"")+b.toString(16);}).join("");}
function admSend(fd,onp){return new Promise(function(res,rej){var x=new XMLHttpRequest();x.open("POST","admin.php?a=chunk");x.responseType="text";
  if(x.upload)x.upload.onprogress=function(e){if(onp&&e.lengthComputable)onp(e.loaded);};
  x.onload=function(){var t=x.responseText||"",j=null;try{j=JSON.parse(t);}catch(e){var k=t.indexOf("{\"ok\":");if(k>=0){try{j=JSON.parse(t.slice(k));}catch(e2){}}}res({status:x.status,json:j});};
  x.onerror=function(){rej(new Error("net"));};x.ontimeout=x.onerror;x.send(fd);});}
/* file را تکه‌تکه (شروع با ۱ مگابایت؛ اگر هاست نپذیرفت خودکار کوچک‌تر) می‌فرستد. موفق: توکن؛ خطا: Error با پیام فارسی */
window.admChunkUpload=function(file,kind,csrf,onProgress,ctl){
  return new Promise(function(resolve,reject){
    var token=admToken(),total=file.size,have=0,size=1048576,fails=0;
    ctl=ctl||{};
    if(!total){reject(new Error("فایل خالی است."));return;}
    function step(){
      if(ctl.cancel){reject(new Error("cancel"));return;}
      var end=Math.min(total,have+size),fd=new FormData();
      fd.append("csrf",csrf);fd.append("kind",kind);fd.append("token",token);fd.append("offset",String(have));fd.append("total",String(total));fd.append("name",file.name||"file");
      fd.append("chunk",file.slice(have,end),"chunk.bin");
      var base=have;
      admSend(fd,function(l){if(onProgress)onProgress(Math.min(total,base+l),total);}).then(function(r){
        var j=r.json;
        if(j&&j.ok){fails=0;have=j.have;if(onProgress)onProgress(have,total);if(j.done)resolve(token);else step();return;}
        if(j&&j.err==="offset"&&typeof j.have==="number"&&j.have<=total){if(++fails>8){reject(new Error(j.msg));return;}have=j.have;step();return;}
        if((r.status===413||r.status===0||(j&&j.err==="toolarge")||(!j&&r.status!==401&&r.status!==403))&&size>65536){size=Math.max(65536,Math.floor(size/2));step();return;}
        reject(new Error(j&&j.msg?j.msg:(r.status===200?"پاسخ نامعتبر از سرور (شاید نشست ورود تمام شده؛ صفحه را دوباره باز کن).":"خطای سرور ("+r.status+")")));
      },function(){if(++fails>5){reject(new Error("اتصال اینترنت قطع شد."));return;}setTimeout(step,Math.min(6000,900*fails));});
    }
    step();
  });
};
function admHuman(b){return b>=1048576?fa((b/1048576).toFixed(1))+" مگابایت":fa(Math.max(1,Math.round(b/1024)))+" کیلوبایت";}
/* نوار پیشرفت زیر فیلد */
function admProg(form,name){
  var box=form.querySelector('.chunk-prog[data-for="'+name+'"]');if(!box)return null;
  var bar=box.querySelector("i"),tx=box.querySelector(".cp-tx");
  return {set:function(p,t,cls){box.className="chunk-prog on";bar.style.width=p+"%";tx.className="cp-tx"+(cls?" "+cls:"");tx.textContent=t;},hide:function(){box.className="chunk-prog";bar.style.width="0";tx.textContent="";}};
}
/* وقتی آپلودی در جریان است، ذخیره‌ی فرم بسته می‌شود تا نیمه‌کاره ثبت نشود */
function admBusy(form,d){
  form.__admBusy=Math.max(0,(form.__admBusy||0)+d);
  Array.prototype.forEach.call(form.querySelectorAll('button[type=submit]'),function(b){
    if(form.__admBusy>0){if(!b.disabled){b.disabled=true;b.__admOff=true;}}
    else if(b.__admOff){b.disabled=false;b.__admOff=false;}
  });
}
if(!window.__admSubmitGuard){window.__admSubmitGuard=1;
  document.addEventListener("submit",function(e){var f=e.target;if(f&&f.__admBusy>0){e.preventDefault();e.stopPropagation();window.admToast("info","آپلود فایل هنوز تمام نشده؛ چند لحظه صبر کن تا نوار پیشرفت به ۱۰۰٪ برسد.");}},true);
}
/* هر آپلود را با یک «کنترل» مدیریت می‌کنیم تا انتخاب تازه، آپلود قبلی را لغو کند و شمارنده‌ی busy دقیقاً یک‌بار کم شود */
function admRun(form,file,kind,prog,label,done,fail){
  var csrfEl=form.querySelector("input[name=csrf]");
  var ctl={cancel:false,active:true};
  admBusy(form,1);
  function end(){if(ctl.active){ctl.active=false;admBusy(form,-1);}}
  ctl.stop=function(){ctl.cancel=true;end();};
  var t0=Date.now();
  prog.set(0,label+" — در حال آپلود…");
  window.admChunkUpload(file,kind,csrfEl.value,function(a,b){
    var pct=Math.round(a*100/b),sec=(Date.now()-t0)/1000,sp=sec>1?a/sec:0,left=sp>0?Math.ceil((b-a)/sp):0;
    prog.set(pct,label+" — "+fa(pct)+"٪ ("+admHuman(a)+" از "+admHuman(b)+")"+(left>3?" — حدود "+fa(left)+" ثانیه‌ی دیگر":""));
  },ctl).then(function(tok){if(ctl.cancel)return;end();done(tok);},function(err){if(ctl.cancel)return;end();fail(err);});
  return ctl;
}

/* ---------- PDF کتاب: آپلود تکه‌تکه ---------- */
Array.prototype.forEach.call(document.querySelectorAll('input[type=file][name="book_pdf"]'),function(inp){
  var form=inp.form,tokEl=form&&form.querySelector("input[name=book_pdf_token]"),prog=form&&admProg(form,"book_pdf");
  if(!form||!tokEl||!prog||!window.FormData||!window.File||!window.Blob||!Blob.prototype.slice)return;
  var ctl=null;
  allDirty.push(function(){return !!(ctl&&ctl.active);});
  inp.addEventListener("change",function(){
    if(ctl){ctl.stop();ctl=null;}
    tokEl.value="";inp.setAttribute("name","book_pdf");
    var f=inp.files&&inp.files[0];
    if(!f){prog.hide();return;}
    if(!/\.pdf$/i.test(f.name||"")&&(f.type||"")!=="application/pdf"){inp.value="";prog.hide();window.admToast("err","فقط فایل PDF قابل قبول است.");return;}
    inp.removeAttribute("name");   /* خودِ فایل همراه فرم فرستاده نمی‌شود؛ فقط توکن آپلود تکه‌ای می‌رود */
    ctl=admRun(form,f,"pdf",prog,f.name+" ("+admHuman(f.size)+")",function(tok){
      tokEl.value=tok;prog.set(100,"✓ آپلود کامل شد ("+admHuman(f.size)+"). برای ثبت نهایی «ذخیره» را بزن.","ok");
    },function(err){
      inp.setAttribute("name","book_pdf");   /* راه قدیمی به‌عنوان پشتیبان */
      prog.set(0,"آپلود ناموفق: "+err.message,"err");
      window.admToast("err","آپلود PDF ناموفق بود: "+err.message);
    });
  });
});

/* ---------- پیش‌نمایش عکس ---------- */
var MAXB=25*1024*1024,OK={"image/jpeg":1,"image/png":1,"image/webp":1};
Array.prototype.forEach.call(document.querySelectorAll('input[type=file][accept^="image"]'),function(inp){
  var box=document.createElement("div");box.className="photo-prev";
  var img=document.createElement("img");img.alt="پیش‌نمایش";
  var info=document.createElement("div");info.className="pi";
  var clr=document.createElement("button");clr.type="button";clr.className="btn alt sm";clr.textContent="حذف انتخاب";
  box.appendChild(img);box.appendChild(info);box.appendChild(clr);
  inp.parentNode.insertBefore(box,inp.nextSibling);
  var url=null;
  var pForm=inp.form,pTok=pForm&&pForm.querySelector("input[name=photo_orig_token]"),pOpt=pForm&&pForm.querySelector("input[name=photo_client_opt]"),pProg=pForm&&admProg(pForm,"photo"),pCtl=null,pSeq=0;
  allDirty.push(function(){return !!(pCtl&&pCtl.active);});
  function pClear(){pSeq++;if(pCtl){pCtl.stop();pCtl=null;}if(pTok)pTok.value="";if(pOpt)pOpt.value="";if(pProg)pProg.hide();}
  function reset(){pClear();if(url){URL.revokeObjectURL(url);url=null;}inp.value="";if(inp.__sync)inp.__sync();box.className="photo-prev";img.removeAttribute("src");info.textContent="";}
  /* کوچک‌سازی در خود مرورگر: GD سرور لازم نیست (راه‌حل دائمی). بلندترین ضلع ۱۲۰۰ پیکسل، JPG با کیفیت ۸۶. نسخه‌ی اصلی جدا و تکه‌تکه به سرور می‌رود. */
  function shrink(f,im){
    if(!pForm||!pTok||!pOpt||!pProg||!window.DataTransfer||!window.File||!HTMLCanvasElement.prototype.toBlob)return;
    var w=im.naturalWidth,h=im.naturalHeight,side=Math.max(w,h);
    if(!w||!h)return;
    if(f.type==="image/jpeg"&&f.size<=300*1024&&side<=1200)return;   /* از قبل کوچک و سبک است */
    var seq=++pSeq,sc=Math.min(1,1200/side),nw=Math.max(1,Math.round(w*sc)),nh=Math.max(1,Math.round(h*sc));
    try{
      var cv=document.createElement("canvas");cv.width=nw;cv.height=nh;
      var cx=cv.getContext("2d");if(!cx)return;
      cx.fillStyle="#fff";cx.fillRect(0,0,nw,nh);
      cx.imageSmoothingEnabled=true;cx.imageSmoothingQuality="high";
      cx.drawImage(im,0,0,nw,nh);
      cv.toBlob(function(bl){
        try{
          if(seq!==pSeq||!bl||bl.size<100||bl.size>=f.size&&sc===1)return;
          var nf=new File([bl],((f.name||"photo").replace(/\.[a-z0-9]+$/i,"")||"photo")+".jpg",{type:"image/jpeg"});
          var dt=new DataTransfer();dt.items.add(nf);inp.files=dt.files;
          pOpt.value="1";
          var s2=document.createElement("div");s2.className="warn";s2.style.color="#17803d";
          s2.textContent="✓ در مرورگر کوچک شد: "+admHuman(f.size)+" ← "+admHuman(bl.size)+" ("+fa(nw)+"×"+fa(nh)+")";info.appendChild(s2);
          if(f.size>nf.size){
            pCtl=admRun(pForm,f,"photo",pProg,"نسخه‌ی اصلی ("+admHuman(f.size)+")",function(tok){
              pTok.value=tok;pProg.set(100,"✓ نسخه‌ی اصلی هم آپلود شد و بعد از «ذخیره» نگه داشته می‌شود.","ok");
            },function(err){
              pProg.set(0,"نسخه‌ی اصلی آپلود نشد ("+err.message+"). عکس کوچک‌شده ذخیره می‌شود و نسخه‌ی اصلی نگه داشته نمی‌شود.","err");
            });
          }
        }catch(e){}
      },"image/jpeg",0.86);
    }catch(e){}
  }
  clr.onclick=reset;
  inp.addEventListener("change",function(){
    var f=inp.files&&inp.files[0];
    pClear();
    if(!f){reset();return;}
    var ty=(f.type||"").toLowerCase(),ex=((f.name||"").match(/\.([a-z0-9]+)$/i)||[])[1];ex=ex?ex.toLowerCase():"";/* اندروید/Drive گاهی type را خالی یا octet-stream می‌دهد؛ پس اگر type معتبر نبود به پسوند نگاه می‌کنیم و اگر پسوندی هم نبود، بررسی واقعی را به باز شدن عکس و سرور می‌سپاریم */var okExt={jpg:1,jpeg:1,png:1,webp:1};var unknown=(ty===""||ty==="application/octet-stream"||ty==="binary/octet-stream");if(!(OK[ty]||(unknown&&(ex===""||okExt[ex])))){reset();window.admToast("err","فرمت عکس باید JPG، PNG یا WEBP باشد.");return;}
    if(f.size>MAXB){reset();window.admToast("err","حجم عکس "+fa((f.size/1048576).toFixed(1))+" مگابایت است؛ حداکثر ۲۵ مگابایت مجاز است.");return;}
    if(url)URL.revokeObjectURL(url);
    url=URL.createObjectURL(f);img.src=url;
    var im=new Image();
    im.onload=function(){
      var r=im.naturalWidth/im.naturalHeight,note="";
      if(Math.min(im.naturalWidth,im.naturalHeight)<300)note='<div class="warn">وضوح عکس پایین است (کمتر از ۳۰۰ پیکسل).</div>';
      else if(r>1)note='<div class="warn">عکس افقی است؛ عکس عمودی ۳ به ۴ بهتر دیده می‌شود.</div>';
      info.innerHTML="";
      var b=document.createElement("b");b.textContent=f.name;info.appendChild(b);
      var s=document.createElement("span");s.textContent=fa(im.naturalWidth)+"×"+fa(im.naturalHeight)+" — "+fa(Math.round(f.size/1024))+" کیلوبایت — این عکس بعد از «ذخیره» جایگزین عکس فعلی می‌شود.";info.appendChild(s);
      if(note){var w=document.createElement("div");w.innerHTML=note;info.appendChild(w.firstChild);}
      shrink(f,im);
    };
    im.onerror=function(){reset();window.admToast("err","این فایل به‌عنوان عکس باز نشد.");};
    im.src=url;
    box.className="photo-prev on";
    info.textContent="در حال بررسی…";
  });
});

/* ---------- میانبر کیبورد ---------- */
document.addEventListener("keydown",function(e){
  var k=(e.key||"").toLowerCase();
  if((e.ctrlKey||e.metaKey)&&!e.altKey&&!e.shiftKey&&(k==="s"||e.code==="KeyS")){
    var f=(document.activeElement&&document.activeElement.form&&document.activeElement.form.hasAttribute("data-draft"))?document.activeElement.form:document.querySelector("form[data-draft]");
    if(f&&f.__admSubmit){e.preventDefault();f.__admSubmit();}
    return;
  }
  if(k==="/"&&!e.ctrlKey&&!e.metaKey&&!e.altKey){
    var a=document.activeElement,tg=a?a.tagName:"";
    if(tg==="INPUT"||tg==="TEXTAREA"||tg==="SELECT"||(a&&a.isContentEditable))return;
    var s=document.querySelector(".tools input[type=text]");
    if(s){e.preventDefault();s.focus();s.select();}
  }
});
var sb=document.querySelector("form[data-draft] .actions button[type=submit]");
if(sb){var isMac=/Mac|iPhone|iPad/.test(navigator.platform||"");sb.title=(isMac?"⌘":"Ctrl")+"+S";var kb=document.createElement("kbd");kb.textContent=(isMac?"⌘":"Ctrl")+"+S";kb.style.marginRight="8px";sb.appendChild(kb);}
})();
JS;
    return '<div class="toasts" id="admToasts" role="region" aria-live="polite" aria-label="پیام‌ها"></div><script>' . $js . '</script>';
}
