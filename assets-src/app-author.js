    // بیوگرافی چندپاراگرافی: خط خالی = پاراگراف، خطی که با ## شروع شود = زیرعنوان (همه‌چیز escape می‌شود؛ هم‌قاعده با bio_to_html در lib.php)
    function formatBioHtml(bio) {
      const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
      let html = '';
      String(bio || '').replace(/\r\n?/g, '\n').trim().split(/\n\s*\n/).forEach(part => {
        let buf = [];
        part.split('\n').forEach(line => {
          line = line.trim();
          if (!line) return;
          const m = line.match(/^##\s*(.+)$/);
          if (m) {
            if (buf.length) { html += '<p>' + esc(buf.join(' ')) + '</p>'; buf = []; }
            html += '<h2 class="author-bio-heading">' + esc(m[1].trim()) + '</h2>';
          } else { buf.push(line); }
        });
        if (buf.length) html += '<p>' + esc(buf.join(' ')) + '</p>';
      });
      return html;
    }

    const translations = {
      fa: {
        menuBtnText: 'منو',
        drawerTitle: 'دسته‌بندی‌های منو',
        menuBestSite: 'پرفروش‌ترین کتاب‌های سایت',
        menuBestWorld: 'پرفروش‌ترین‌ها در جهان',
        menuBestIran: 'پرفروش‌ترین‌ها در ایران',
        menuDiscounted: 'تخفیفات ویژه',
        menuSavedBooks: 'کتاب‌های ذخیره‌شده',
        labelGenres: '🏷️ ژانر کتاب',
        labelAuthors: '✍️ نام نویسنده',
        labelCategories: '📚 دسته‌بندی موضوعی',
        catLiterature: 'ادبیات',
        catHistory: 'تاریخ',
        catFiction: 'داستان و رمان',
        catPsychology: 'روان‌شناسی',
        catSuccess: 'موفقیت',
        catPhilosophy: 'فلسفه و منطق',
        labelPublishers: '🏛️ نام ناشر',
        labelTranslators: '🌐 نام مترجم',
        btnAboutText: 'درباره ما و کسب درآمد',
        clearFilterBtn: 'نمایش همه کتاب‌ها',
        filterPrefix: 'صفحه اختصاصی: ',
        searchInFilterPrefix: 'جستجو در آثار ',
        searchInBestPrefix: 'جستجو در بین ',
        searchInGenrePrefix: 'جستجو در بین کتاب‌های ',
        salesPrefix: 'میزان فروش: ',
        salesSiteUnit: 'خرید در سایت',
        salesIranUnit: 'نسخه در ایران',
        salesWorldUnit: 'تیراژ جهانی',
        viewModeLabel: 'نحوه نمایش و چینش:',
        viewGrid: 'شبکه‌ای',
        viewList: 'ردیفی',
        loadMoreBooksBtn: 'نمایش کتاب‌های بیشتر',
        logoBrand: 'PDF ',
        logoAccent: 'مارکت',
        titlePrevBook: 'کتاب قبلی',
        titleNextBook: 'کتاب بعدی',
        titlePrev: 'قبلی',
        titleNext: 'بعدی',
        titleViewGrid: 'نمایش شبکه‌ای (کارت)',
        titleViewList: 'نمایش ردیفی (لیستی)',
        titleAvatarGuide: 'راهنمای آواتارها',
        titleChangeAvatar: 'تغییر آواتار پروفایل',
        titleEditUsername: 'ویرایش نام کاربری',
        titleRefGuide: 'راهنمای قوانین زیرمجموعه‌ها',
        supportModalTitle: 'ارسال پیام به پشتیبانی',
        phChangeUserPhone: 'شماره همراه شما',
        commaSep: '،',
        docTitleHome: 'PDF مارکت | مرجع کتاب‌های دیجیتال',
        themeTabSite: '🎨 تم سایت',
        themeTabFrame: '🖼️ رنگ کادر',
        themeDarkRainbow: '🌌 رنگین‌کمانی تیره',
        themeDarkRainbowTip: 'تم رنگین‌کمانی تیره (متحرک)',
        themePastelRainbow: '🎀 رنگین‌کمانی پاستیلی',
        themePastelRainbowTip: 'تم رنگین‌کمانی پاستیلی (متحرک)',
        themeResetFrame: '↺ بازگشت به رنگ پیش‌فرض تم',
        themeResetFrameTip: 'رنگ کادر، دکمه‌ها و لینک‌ها دوباره مثل پیش‌فرض تم (قرمز/مرجانی) بشه',
        authorBackText: 'بازگشت به فروشگاه',
        authorImgAlt: window.__PAGE_DATA.nameFa,
        langBtn: 'English',
        welcomeTitle: 'به فروشگاه PDF مارکت مرجع PDF تمام کتاب های معتبر از نویسنده های معتبر خوش آمدید',
        spotTag: '✨ پیشنهاد تصادفی برای شما',
        searchPlaceholder: 'جستجو در تمام کتاب‌ها...',
        criteriaAll: 'جستجوی کلی',
        criteriaGenre: 'ژانر کتاب',
        criteriaTitle: 'نام کتاب',
        criteriaAuthor: 'نام نویسنده',
        criteriaPublisher: 'نام ناشر',
        criteriaTranslator: 'نام مترجم',
        criteriaPages: 'تعداد صفحات',
        authorLabel: 'نویسنده',
        publisherLabel: 'ناشر',
        translatorLabel: 'مترجم',
        genreLabel: 'ژانر و موضوع',
        btnDetails: '🔍 مشخصات و بیوگرافی',
        btnSaveForLater: '🔖 ذخیره',
        btnSaved: '❤️ ذخیره‌شده',
        bioModalTitle: 'معرفی و مشخصات کتاب',
        bioSummaryTitle: '📝 درباره و بیوگرافی این کتاب:',
        authorProfileHeading: 'پروفایل نویسنده',
        authorLifespanLabel: 'سال تولد – وفات',
        authorAliveSuffix: '(هم‌اکنون)',
        authorNationalityLabel: 'ملیت',
        authorGenreLabel: 'سبک و ژانر ادبی',
        authorAwardsLabel: 'دستاوردها و جایگاه',
        authorBioTitle: '📝 درباره نویسنده:',
        authorBooksHeadingPrefix: '📚 کتاب‌های',
        authorNoBooksText: 'در حال حاضر کتابی از این نویسنده روی سایت ثبت نشده است.',
        finalTotalPriceLabel: 'قیمت کل:',
        pagesUnit: 'صفحه',
        currency: 'تومان',
        btnRead: 'مطالعه نمونه',
        btnBuy: 'خرید کتاب',
        modalClose: 'بستن پنجره',
        readerTitlePrefix: 'مطالعه فصل اول: ',
        sampleText: 'این محیط پیش‌نمایش فصل اول است؛ زمان مطالعه اختصاصی شما به طور دقیق در حال ثبت در پنل شخصی است.',
        buyAlert: 'فایل کتاب دیجیتال با واترمارک اختصاصی آماده دانلود شد.',
        notFoundText: '❌ کتاب یا موردی با این مشخصات موجود نیست',
        cartBtnText: 'سبد خرید',
        cartModalTitle: '🛒 سبد خرید و نهایی‌سازی سفارش',
        cartTotalPriceLabel: 'مبلغ قابل پرداخت:',
        checkoutBtn: 'نهایی‌سازی و خرید کتاب‌ها',
        emptyCart: 'سبد خرید شما خالی است.',
        btnApplyVoucher: 'تایید',
        voucherSuccess: '✅ تخفیف با موفقیت اعمال شد!',
        voucherError: '❌ کد تخفیف نامعتبر است.',
        savedModalTitle: '🔖 کتاب‌های ذخیره‌شده (برای بعد)',
        emptySaved: 'هیچ کتابی در لیست ذخیره‌شده‌ها نیست.',
        drawerShowMore: 'نمایش بیشتر…',
        suggestMore: 'نتایج بیشتر در فهرست پایین',
        btnClearSaved: '🗑️ پاک کردن همه‌ی کتاب‌های ذخیره‌شده',
        confirmClearSaved: 'همه‌ی کتاب‌های ذخیره‌شده از لیست پاک شوند؟ این کار قابل بازگشت نیست.',
        avatarModalTitle: '🖼️ انتخاب آواتار پروفایل',
        avatarHelpTitle: '❓ راهنمای آواتارها',
        avatarModalDesc: 'آواتار خود را از بین موارد آزاد انتخاب کنید یا روی آواتارهای قفل‌شده کلیک کنید تا شرایط باز کردن آن‌ها را ببینید:',
        customAvatarTitle: '✨ آواتار اختصاصی و شخصی‌سازی‌شده (مخصوص کاربر برتر)',
        customAvatarDesc: '⚠️ قانون سایت: آپلود عکس شخصی یا چهره‌ی واقعی انسان ممنوع است. عکس شما تا زمان تایید توسط مدیر اصلی سایت، برای هیچ‌کس (حتی خودتان) نمایش داده نمی‌شود و به‌جای آن یک آواتار موقت روی پروفایلتان می‌ماند. بررسی حداکثر ۲ روز طول می‌کشد.',
        btnUploadCustom: 'ادامه و ارسال برای تأیید مدیر',
        btnCancelUpload: 'انصراف',
        changeAvatarText: 'تغییر تصویر پروفایل 🖼️',
        btnLoginRegister: 'ورود / ثبت‌نام',
        btnContest: '🏆 مسابقه',
        tabLoginTitle: 'ورود با رمز',
        tabRegisterTitle: 'ثبت‌نام',
        panelHeading: '👤 پنل شخصی کاربر',
        btnLogout: 'خروج از حساب',
        btnPanelAbout: 'هر آن چیزی که باید بدانید (درباره ما)',
        btnDesktopModeOn: 'نمایش نسخه رایانه‌ای',
        btnDesktopModeOff: 'بازگشت به نسخه موبایل',
        panelUserCardTitle: '👤 مشخصات کاربر',
        panelRefCardTitle: '👥 وضعیت زیرمجموعه‌ها',
        panelTotalRefsLabel: 'کل افراد دعوت‌شده:',
        panelBatchLabel: 'پیشرفت دوره ۱۰ نفره فعلی:',
        panelTierNotice: 'به ازای هر ۱۰ نفری که از طریق شما عضو شوند، یک کد تخفیف پلکانی جدید به لیست کدهای تخفیف پنل شما اضافه می‌شود. شرایط بازگشایی آواتارها مستقل از این پاداش است و در بخش «انتخاب آواتار» نمایش داده می‌شود.',
        panelWalletCardTitle: '💰 موجودی کیف پول و درآمد',
        panelCashoutLimit: 'سقف برداشت نقدی: ۱,۰۰۰,۰۰۰ تومان',
        btnViewTxStatus: 'وضعیت تراکنش‌ها',
        panelReadCardTitle: '⏱️ زمان کل مطالعه کتاب‌ها',
        panelReadingRewardHint: 'رسیدن به ۵۰ ساعت = ۴۰٪ هدیه مطالعه',
        panelVouchersTitle: '🎁 کدهای تخفیف شما',
        panelVoucherRule: '⚠️ قانون تخفیف‌ها: طبق طراحی و مقررات سایت، نمی‌توانید همزمان دو تخفیف با درصد یکسان داشته باشید؛ با دریافت تخفیف مشابه جدید، یکی از آنها می‌سوزد.',
        panelRefLinkTitle: '🔗 کد معرف و لینک دعوت اختصاصی شما',
        btnCopyCode: 'کپی کد',
        btnCopyLink: 'کپی لینک',
        panelShelfTitle: '📚 قفسه کتاب‌های شما',
        shelfSelectLabel: 'فیلتر وضعیت:',
        optShelfAll: 'همه کتاب‌ها',
        optShelfReading: '📖 در حال خواندن',
        optShelfFinished: '✅ خوانده‌شده',
        optShelfUnread: '⏳ خوانده‌نشده',
        panelTableTitle: 'تاریخچه مطالعه',
        tableUnitLabel: 'واحد:',
        filterDateLabel: 'انتخاب تاریخ:',
        optUnitMin: 'دقیقه',
        optUnitHour: 'ساعت',
        btnPanelAsk: 'سوال، نظر یا پیشنهادی دارید؟ (پشتیبانی و بازخورد)',
        entryWelcomeTitle: 'خوش آمدید به PDF مارکت',
        entryWelcomeDesc: 'مرجع اختصاصی برترین کتاب‌های دیجیتال؛ با مطالعه آنلاین و آفلاین، اشتراک‌گذاری با دوستان و ثبت‌نام در سایت، از تخفیف‌های ویژه و هدایای نقدی بهره‌مند شوید.',
        newAlertHead: '📢 راهنمای مهم برای شما (کاربر گرامی تازه‌وارد):',
        newAlertBody: '۱. لطفاً از منوی بالای صفحه بخش <strong>«درباره ما»</strong> را مطالعه کنید.<br>۲. برای دسترسی به پنل کاربری، <strong>حتماً در سایت ثبت‌نام نمایید.</strong>',
        btnEntryStart: 'ورود و گشت‌وگذار در فروشگاه',
        aboutHeading: 'درباره PDF مارکت',
        aboutF1Title: 'کتاب‌های PDF دسته‌بندی‌شده در پنل شخصی',
        aboutF1Desc: 'تمامی کتاب‌های خریداری‌شده را به صورت PDF منظم و دسته‌بندی‌شده برای همیشه در پنل شخصی خود دارید و هر زمان بخواهید می‌توانید آن‌ها را بخوانید.',
        aboutF2Title: 'نحوه کسب درآمد',
        aboutF2Desc: 'سیستم پاداش سایت بر پایه دو لایه بالاسری طراحی شده است:<br>۱. <strong>زیرمجموعه مستقیم (لایه اول):</strong> با معرفی هر کاربر جدید، بابت هر خریدی که او انجام دهد <strong>۲۵٪ پورسانت مستقیم</strong> دریافت می‌کنید.<br>۲. <strong>بونوس کتاب مشترک (۳۰٪):</strong> اگر زیرمجموعه مستقیم شما کتابی را تهیه کند که خودتان قبلاً آن را خریده‌اید (لازم نیست آن را خوانده باشید)، این خرید واجد شرایط بونوس می‌شود؛ اما پورسانت شما <strong>یکی‌درمیان</strong> به ۳۰٪ افزایش می‌یابد (یعنی از هر دو خریدِ واجد شرایط، فقط دومی به ۳۰٪ می‌رسد و بقیه همان ۲۵٪ باقی می‌ماند). سایر خریدهای زیرمجموعه، که کتابشان را شما نخریده‌اید، همیشه ۲۵٪ است. (این افزایش درصد فقط مختص یک لایه بالاسری مستقیم است و به لایه دوم نمی‌رسد).<br>۳. <strong>زیرمجموعه غیرمستقیم (لایه دوم):</strong> اگر زیرمجموعه شما فرد جدیدی را دعوت کند، شما از خریدهای آن فرد جدید نیز <strong>۱۰٪ پورسانت</strong> دریافت می‌کنید.<br>۴. <strong>محدودیت توزیع پاداش:</strong> پورسانت خریدها همیشه <strong>تنها به ۲ لایه بالاسری</strong> تعلق می‌گیرد و برای لایه‌های بعدی (لایه سوم به بعد) سودی به شما نخواهد رسید.<br>۵. <strong>کتاب‌های «تخفیفات ویژه»:</strong> خرید این کتاب‌ها (که هر ماه با قیمت ۲۰ تا ۳۰ درصد تخفیف عرضه می‌شوند) پورسانتی برای لایه‌های بالاسری ندارد.',
        aboutF2bTitle: 'چگونگی ثبت و جذب زیرمجموعه',
        aboutF2bDesc: 'برای اینکه فردی به عنوان زیرمجموعه شما ثبت شود و پورسانت خریدهایش به کیف پول شما واریز گردد، فقط کافی است یکی از دو روش زیر انجام شود:<br>۱. <strong>ثبت‌نام از طریق لینک اختصاصی:</strong> لینک دعوت خود را از پنل کاربری کپی کرده و برای دوستتان بفرستید؛ با کلیک روی آن و ثبت‌نام، او خودکار زیرمجموعه شما می‌شود.<br>۲. <strong>وارد کردن کد معرف:</strong> اگر دوستتان مستقیماً وارد سایت شد، به او بگویید هنگام ثبت‌نام، <strong>کد معرف اختصاصی شما</strong> (موجود در پنل شخصی‌تان) را در کادر مربوطه وارد کند.<br>با انجام هر کدام از این دو راه، سیستم بلافاصله او را به عنوان زیرمجموعه شما شناسایی می‌کند.',
        aboutF3Title: 'تخفیف‌های پنل کاربری، مطالعه و مناسبت‌ها',
        aboutF3Desc: 'به محض ثبت‌نام، ۵ کوپن تخفیف اول شما (به ترتیب ۵۰٪، ۴۰٪، ۳۰٪، ۲۰٪ و ۱۰٪) در پنل شخصی قرار می‌گیرد. همچنین به ازای هر ۵۰ ساعت مطالعه تاییدشده در سایت، یک کد تخفیف ویژه ۴۰٪ هدیه مطالعه دریافت می‌کنید. این کوپن‌ها بدون انقضا هستند؛ اما توجه داشته باشید که نمی‌توانید همزمان دو کوپن هم‌درصد نگهداری کنید و دریافت کوپن مشابه جدید، قبلی را می‌سوزاند. تخفیف‌های مناسبتی (مانند ۲۰٪ جشن‌های ملی) نیاز به کوپن ندارند و خودکار روی قیمت کتاب‌ها فعال می‌شوند.',
        aboutF4Title: 'تخفیف‌های پلکانی شبکه دعوت',
        aboutF4Desc: 'علاوه بر پورسانت‌های نقدی، به ازای هر ۱۰ نفری که از طریق لینک یا کد اختصاصی شما ثبت‌نام کنند، یک کد تخفیف پلکانی جدید به لیست کدهای تخفیف پنل شما اضافه می‌شود تا هر زمان که خواستید از آن استفاده کنید.',
        aboutF5Title: 'تسویه حساب و خرید رایگان کتاب',
        aboutF5Desc: 'پورسانت‌های شما با رسیدن به سقف ۱ میلیون تومان قابل برداشت نقدی به شماره شبای بانکی خواهد بود. همچنین می‌توانید بدون نیاز به برداشت، با موجودی کیف پول خود مستقیماً کتاب تهیه کرده و خریدها را کاملاً رایگان انجام دهید.',
        aboutF6Title: 'آواتارها؛ تصویر پروفایل و نماد پیشرفت شما',
        aboutF6Desc: 'آواتار همان تصویر پروفایل شماست. ۶ آواتار رایگان از ابتدا در اختیار شماست و ۱۹ آواتار ویژه‌ی قفل‌شده را با فعالیت در سایت باز می‌کنید.<br>۱. <strong>باز کردن آواتارها:</strong> آواتارهای قفل‌شده به‌ترتیب و یکی‌یکی باز می‌شوند. برای باز شدن آواتارِ نوبت‌دار باید از همان لحظه‌ی رسیدن نوبتش، کتاب جدید بخرید، ساعت مطالعه جمع کنید و زیرمجموعه دعوت کنید (کارهای قبل از رسیدن نوبت حساب نمی‌شود). هرچه جلوتر بروید شرط‌ها سخت‌تر می‌شود و آخرین آواتارها امی و لونا هستند. روی هر آواتار قفل‌شده بزنید تا شرطش را ببینید.<br>۲. <strong>آواتار اختصاصی ✨:</strong> با باز کردن حداقل ۹ آواتار وارد رقابت ماهانه می‌شوید. نفر اول هر ماه (بر اساس خرید کتاب، دعوت زیرمجموعه، دقایق مطالعه و دقایق حضور در سایت، به همین ترتیب اولویت) در ماه بعد می‌تواند تصویر دلخواه خودش را روی پروفایل بگذارد.<br>۳. <strong>قانون تصویر:</strong> آپلود عکس شخصی یا چهره‌ی واقعی ممنوع است و هر تصویر قبل از نمایش توسط مدیر سایت بررسی می‌شود (حداکثر ۲ روز).',
        supportTitle: 'سوالی ذهن شما را درباره عملکرد سایت مشغول کرده است؟',
        supportDesc: 'اگر سوال، نظر یا پیشنهادی دارید، با ما در میان بگذارید.',
        btnAskQuestion: '✍️ پرسش و بازخورد',
        tabSupportQ: '❓ طرح سوال عمومی',
        tabSupportF: '💡 نظرات و پیشنهادات (اعضا)',
        supportQDesc: 'سوال خود را درباره سایت، نحوه خرید یا درآمدزایی مطرح نمایید.',
        btnSubmitQ: 'تایید و ارسال سوال',
        feedbackLoginNotice: 'ثبت نظرات و پیشنهادات درباره عملکرد سایت فقط برای کاربران عضو امکان‌پذیر است.',
        btnLoginOrReg: 'ورود یا ثبت‌نام در سایت',
        feedbackGreeting: 'کاربر گرامی',
        feedbackPrompt: 'خوشحال می‌شویم نقطه نظرات و پیشنهادات خود را بنویسید:',
        btnSubmitFeedback: 'ثبت و ارسال پیشنهاد به مدیریت',
        forgotPassLink: 'فراموشی رمز عبور؟',
        btnLoginSubmit: 'ورود به پنل شخصی',
        regNoticeText: '📢 جهت آشنایی با نحوه کارکرد سایت حتماً پس از عضویت بخش <strong>«درباره ما»</strong> را مطالعه نمایید.',
        btnRegNext: 'مرحله بعد',
        regRefPrompt: 'اگر کد معرف دارید وارد کنید در غیر این صورت خالی بزارید و تایید رو بزنید:',
        btnRegConfirm: 'تأیید و تکمیل ثبت‌نام',
        btnSendForgotOtp: 'ارسال کد پیامکی بازیابی',
        btnResetPassword: 'ثبت رمز جدید و ورود',
        changeUserModalTitle: 'تغییر نام کاربری (هر ۲۴ ساعت ۱ بار)',
        changeUserPhoneHint: 'جهت امنیت حساب، لطفاً شماره تلفن همراه خود را جهت دریافت کد تأیید پیامکی وارد نمایید:',
        btnSendChangeOtp: 'ارسال کد تأیید پیامک',
        btnVerifyChangeOtp: 'تأیید کد پیامک',
        btnSaveNewUsername: 'ذخیره نام کاربری جدید',
        phoneVerifyModalTitle: 'تأیید شماره همراه جهت تسویه حساب نقدی',
        phoneVerifyExplanation: 'کاربر گرامی، جهت حفظ امنیت مالی، احراز مالکیت حساب و امکان‌پذیر شدن تسویه حساب و برداشت پورسانت‌ها به شماره شبای بانکی، تأیید شماره همراه با کد پیامکی برای هر حساب الزامی است.',
        btnSendVerifySms: '📩 ارسال کد تأیید پیامکی',
        btnConfirmPhoneOtp: 'تأیید نهایی شماره همراه',
        phoneVerifiedBadge: '✅ شماره تأیید شده',
        phoneUnverifiedBadge: '⚠️ تأیید نشده',
        btnVerifyPhone: 'تأیید شماره تلفن',
        txModalTitle: '📊 وضعیت تراکنش‌های کیف پول',
        txFilterAll: 'همه',
        txFilterDeposit: 'واریزها',
        txFilterWithdraw: 'برداشت‌ها',
        txTimeLabel: 'بازه:',
        txTimeAll: 'همه زمان‌ها',
        txTimeDay: 'روز جاری',
        txTimeMonth: 'یک ماه اخیر',
        txTimeYear: 'یک سال اخیر',
        refHelpTitle: '❓ راهنمای کسب درآمد و زیرمجموعه‌گیری',
        refHelpDesc1: 'سیستم پاداش سایت بر پایه دو لایه بالاسری طراحی شده است: زیرمجموعه مستقیم (لایه اول) ۲۵٪ پورسانت که یکی‌درمیان با بونوس کتاب مشترک به ۳۰٪ می‌رسد. زیرمجموعه غیرمستقیم (لایه دوم) نیز ۱۰٪ پورسانت به همراه دارد.',
        refHelpDesc2: '<strong>چگونگی جذب:</strong> کافی است لینک دعوت خود را برای دوستانتان بفرستید یا از آن‌ها بخواهید کد معرف اختصاصی شما را هنگام ثبت‌نام وارد کنند.'
      },
      en: {
        menuBtnText: 'Menu',
        drawerTitle: 'Store Categories',
        menuBestSite: 'Bestsellers in Store',
        menuBestWorld: 'Bestsellers Worldwide',
        menuBestIran: 'Bestsellers in Iran',
        menuDiscounted: 'Special Discounts',
        menuSavedBooks: 'Saved Books',
        labelGenres: '🏷️ Book Genres',
        labelAuthors: '✍️ Authors',
        labelCategories: '📚 Categories',
        catLiterature: 'Literature',
        catHistory: 'History',
        catFiction: 'Fiction & Novel',
        catPsychology: 'Psychology',
        catSuccess: 'Self-Help & Success',
        catPhilosophy: 'Philosophy & Logic',
        labelPublishers: '🏛️ Publishers',
        labelTranslators: '🌐 Translators',
        btnAboutText: 'About Us & Affiliate Income',
        clearFilterBtn: 'Show All Books',
        filterPrefix: 'Dedicated Page: ',
        searchInFilterPrefix: 'Search inside works of ',
        searchInBestPrefix: 'Search among ',
        searchInGenrePrefix: 'Search inside genre: ',
        salesPrefix: 'Sales: ',
        salesSiteUnit: 'store purchases',
        salesIranUnit: 'copies in Iran',
        salesWorldUnit: 'worldwide circulation',
        viewModeLabel: 'Layout View:',
        viewGrid: 'Grid',
        viewList: 'List',
        loadMoreBooksBtn: 'Show More Books',
        logoBrand: 'PDF ',
        logoAccent: 'Market',
        titlePrevBook: 'Previous book',
        titleNextBook: 'Next book',
        titlePrev: 'Previous',
        titleNext: 'Next',
        titleViewGrid: 'Grid view (cards)',
        titleViewList: 'List view (rows)',
        titleAvatarGuide: 'Avatar guide',
        titleChangeAvatar: 'Change profile avatar',
        titleEditUsername: 'Edit username',
        titleRefGuide: 'Sub-users rules guide',
        supportModalTitle: 'Send a message to support',
        phChangeUserPhone: 'Your mobile number',
        commaSep: ',',
        docTitleHome: 'PDF Market | Digital Books Reference',
        themeTabSite: '🎨 Site Theme',
        themeTabFrame: '🖼️ Frame Color',
        themeDarkRainbow: '🌌 Dark Rainbow',
        themeDarkRainbowTip: 'Dark rainbow theme (animated)',
        themePastelRainbow: '🎀 Pastel Rainbow',
        themePastelRainbowTip: 'Pastel rainbow theme (animated)',
        themeResetFrame: '↺ Reset to theme default color',
        themeResetFrameTip: 'Frame, buttons and links go back to the theme default color (red/coral)',
        authorBackText: 'Back to store',
        authorImgAlt: window.__PAGE_DATA.nameEn,
        langBtn: 'فارسی',
        welcomeTitle: 'Welcome to PDF Market, the ultimate reference for authentic PDF books by renowned authors',
        spotTag: '✨ Recommended for you',
        searchPlaceholder: 'Search all books...',
        criteriaAll: 'All Fields',
        criteriaGenre: 'Book Genre',
        criteriaTitle: 'Book Title',
        criteriaAuthor: 'Author Name',
        criteriaPublisher: 'Publisher Name',
        criteriaTranslator: 'Translator Name',
        criteriaPages: 'Page Count',
        authorLabel: 'Author',
        publisherLabel: 'Publisher',
        translatorLabel: 'Translator',
        genreLabel: 'Genre & Category',
        btnDetails: '🔍 Book Bio & Details',
        btnSaveForLater: '🔖 Save',
        btnSaved: '❤️ Saved',
        bioModalTitle: 'Book Overview & Details',
        bioSummaryTitle: '📝 Book Biography & Synopsis:',
        authorProfileHeading: 'Author Profile',
        authorLifespanLabel: 'Born – Died',
        authorAliveSuffix: '(present)',
        authorNationalityLabel: 'Nationality',
        authorGenreLabel: 'Literary Genre & Style',
        authorAwardsLabel: 'Recognition & Legacy',
        authorBioTitle: '📝 About the Author:',
        authorBooksHeadingPrefix: '📚 Books by',
        authorNoBooksText: 'No books by this author are listed on the site yet.',
        finalTotalPriceLabel: 'Total Price:',
        pagesUnit: 'pages',
        currency: 'Toman',
        btnRead: 'Read Sample',
        btnBuy: 'Buy Book',
        modalClose: 'Close Window',
        readerTitlePrefix: 'Reading Chapter 1: ',
        sampleText: 'This is the preview of Chapter 1; reading time is actively tracked in your personal panel.',
        buyAlert: 'Digital book PDF with dynamic watermark is ready for download.',
        notFoundText: '❌ No book or match found for this query',
        cartBtnText: 'Cart',
        cartModalTitle: '🛒 Shopping Cart & Checkout',
        cartTotalPriceLabel: 'Total Amount:',
        checkoutBtn: 'Finalize & Purchase Books',
        emptyCart: 'Your shopping cart is empty.',
        btnApplyVoucher: 'Apply',
        voucherSuccess: '✅ Discount applied successfully!',
        voucherError: '❌ Invalid voucher code.',
        savedModalTitle: '🔖 Saved Books (For Later)',
        emptySaved: 'No books in your saved list.',
        drawerShowMore: 'Show more…',
        suggestMore: 'More results in the list below',
        btnClearSaved: '🗑️ Clear all saved books',
        confirmClearSaved: 'Remove all saved books from your list? This cannot be undone.',
        avatarModalTitle: '🖼️ Select Profile Avatar',
        avatarHelpTitle: '❓ Avatar Guide',
        avatarModalDesc: 'Choose your avatar from free ones or unlock special & custom avatars by fulfilling the conditions:',
        customAvatarTitle: '✨ Custom Personalized Avatar (For the #1 Ranked User)',
        customAvatarDesc: '⚠️ Site rule: uploading a personal or real human face photo is prohibited. Your photo stays hidden (even from you) until the site admin approves it, and a temporary avatar shows on your profile meanwhile. Review takes up to 2 days at most.',
        btnUploadCustom: 'Next: Submit for Admin Approval',
        btnCancelUpload: 'Cancel',
        changeAvatarText: 'Change Profile Picture 🖼️',
        btnLoginRegister: 'Login / Register',
        btnContest: '🏆 Contest',
        tabLoginTitle: 'Password Login',
        tabRegisterTitle: 'Register',
        panelHeading: '👤 Personal User Account',
        btnLogout: 'Log Out',
        btnPanelAbout: 'Comprehensive Affiliate & Rules Guide (About Us)',
        btnDesktopModeOn: 'Show Desktop Version',
        btnDesktopModeOff: 'Switch Back to Mobile',
        panelUserCardTitle: '👤 User Profile',
        panelRefCardTitle: '👥 Referral Network',
        panelTotalRefsLabel: 'Total Invited Users:',
        panelBatchLabel: 'Current 10-User Batch:',
        panelTierNotice: 'For every 10 users who join through you, a new tiered discount voucher is added to your voucher list. Avatar unlock requirements are separate and are shown in the avatar selection screen.',
        panelWalletCardTitle: '💰 Wallet Balance & Earnings',
        panelCashoutLimit: 'Minimum Payout: 1,000,000 Toman',
        btnViewTxStatus: 'Transaction Status',
        panelReadCardTitle: '⏱️ Total Book Reading Time',
        panelReadingRewardHint: '50 reading hours reward = 40% voucher discount',
        panelVouchersTitle: '🎁 Your Discount Vouchers',
        panelVoucherRule: '⚠️ Voucher Rule: You cannot hold duplicate percentage codes simultaneously; new duplicate codes overwrite the existing one.',
        panelRefLinkTitle: '🔗 Unique Referral Code & Invite Link',
        btnCopyCode: 'Copy Code',
        btnCopyLink: 'Copy Link',
        panelShelfTitle: '📚 Your Personal Library Shelf',
        shelfSelectLabel: 'Status Filter:',
        optShelfAll: 'All Books',
        optShelfReading: '📖 Currently Reading',
        optShelfFinished: '✅ Finished Reading',
        optShelfUnread: '⏳ Not Read Yet',
        panelTableTitle: 'Reading History',
        tableUnitLabel: 'Unit:',
        filterDateLabel: 'Select Date:',
        optUnitMin: 'Minutes',
        optUnitHour: 'Hours',
        btnPanelAsk: 'Have a question or feedback? (Support Desk)',
        entryWelcomeTitle: 'Welcome to PDF Market',
        entryWelcomeDesc: 'Your digital destination for authentic PDF books. Read online and offline, share with friends, register, and unlock special discounts and instant earnings.',
        newAlertHead: '📢 Important Onboarding Guide for You (New Visitor):',
        newAlertBody: '1. Please review <strong>"About Us"</strong>.<br>2. To access full features, <strong>please register.</strong>',
        btnEntryStart: 'Enter & Explore Bookstore',
        aboutHeading: 'About PDF Market | Simple, Transparent & Rewarding',
        aboutF1Title: 'Categorized PDF Books in Your Personal Library',
        aboutF1Desc: 'All your purchased books remain permanently organized in your personal account panel as PDF files, ready for you to read whenever you wish.',
        aboutF2Title: 'How to Earn Income',
        aboutF2Desc: 'Our affiliate reward system is structured strictly across two upline tiers:<br>1. <strong>Direct Referrals (Tier 1):</strong> When you invite a new user, you receive a <strong>25% direct commission</strong> on every purchase they make.<br>2. <strong>Shared Book Bonus (30%):</strong> If your direct referral buys a book that you have already purchased (you do not need to have read it), that purchase becomes eligible for the bonus; however, your commission rises to <strong>30%</strong> only <strong>every other time</strong> (i.e., of every two eligible purchases, only the second one gets 30%, the rest stay at 25%). All other purchases by your referral, of books you have not bought, always earn 25%. (This bonus applies exclusively to the immediate upline tier and does not elevate Tier 2 earnings).<br>3. <strong>Indirect Referrals (Tier 2):</strong> When your direct referral invites a new user, you automatically earn a <strong>10% commission</strong> on all purchases made by that new user.<br>4. <strong>Two-Tier Distribution Limit:</strong> Purchase commissions are distributed <strong>only to the immediate two upline tiers</strong>; purchases made from Tier 3 onward do not generate commissions for you.<br>5. <strong>"Special Discount" books:</strong> purchases of these books (offered every month at 20-30% off) do not generate any commission for the upline tiers.',
        aboutF2bTitle: 'How to Invite & Register Referrals',
        aboutF2bDesc: 'For a new user to be officially linked as your referral and generate purchase commissions in your wallet, simply ensure they use one of these two methods:<br>1. <strong>Registration via Unique Invite Link:</strong> Copy your personal referral link from your user panel and send it to your friend; registering through that link automatically links them to your account.<br>2. <strong>Entering Your Referral Code:</strong> If they visit the website directly, remind them to enter your <strong>unique referral code</strong> (found in your personal dashboard) during the registration step.<br>Using either method instantly registers them in your referral network.',
        aboutF3Title: 'User Panel Vouchers, Reading Rewards & Festivals',
        aboutF3Desc: 'Upon registration, your first 5 purchase vouchers (50%, 40%, 30%, 20%, 10%) are unlocked in your account panel. Additionally, completing every 50 verified reading hours awards a special 40% reading voucher. These codes do not expire; however, duplicate percentage codes cannot be stored simultaneously—acquiring an identical percentage voucher replaces the former code. Festival discounts apply automatically with no codes required.',
        aboutF4Title: 'Tiered Network Referral Discounts',
        aboutF4Desc: 'Alongside cash subsidies, every 10 referrals who register through your link grant revolving tiered discount vouchers of 20%, 15%, and 10% into your account.',
        aboutF5Title: 'Payouts & Free Book Purchases',
        aboutF5Desc: 'Your commissions can be withdrawn directly to your bank account via Sheba once you reach 1,000,000 Toman. Alternatively, you can spend wallet balances directly in the store to acquire any book completely free of charge.',
        aboutF6Title: 'Avatars: Your Profile Picture & Progress Badge',
        aboutF6Desc: 'An avatar is your profile picture. 6 free avatars are available from the start, and 19 special locked avatars are unlocked through activity on the site.<br>1. <strong>Unlocking avatars:</strong> Locked avatars open one at a time, in order. To unlock the avatar whose turn it is, you must buy new books, accumulate reading hours and invite referrals from the moment its turn begins (anything done before its turn does not count). Requirements get harder as you progress, and the final avatars are Emi and Luna. Tap any locked avatar to see its requirements.<br>2. <strong>Custom avatar ✨:</strong> Once you unlock at least 9 avatars, you enter the monthly contest. The #1 user of each month (ranked by books bought, referrals, reading minutes and minutes on site, in that priority order) can set a photo of their choice on their profile during the following month.<br>3. <strong>Photo rule:</strong> uploading a personal photo or a real human face is prohibited, and every image is reviewed by the site admin before it is shown (up to 2 days).',
        supportTitle: 'Have Questions About Platform Operations?',
        supportDesc: 'If you have questions regarding site mechanics, subsidies, or reading, feel free to ask.',
        btnAskQuestion: '✍️ Ask Support Desk',
        tabSupportQ: '❓ General Question',
        tabSupportF: '💡 Feedback & Suggestions (Members)',
        supportQDesc: 'Submit your inquiry regarding purchases, library management, or affiliate earnings.',
        btnSubmitQ: 'Submit Question',
        feedbackLoginNotice: 'Submitting feedback and suggestions is reserved exclusively for registered members.',
        btnLoginOrReg: 'Login or Register',
        feedbackGreeting: 'Dear Member',
        feedbackPrompt: 'We value your feedback and recommendations to improve our platform:',
        btnSubmitFeedback: 'Submit Feedback to Management',
        forgotPassLink: 'Forgot Password?',
        btnLoginSubmit: 'Sign In to Account',
        regNoticeText: '📢 To learn how the site works, please make sure to read the <strong>"About Us"</strong> section after signing up.',
        btnRegNext: 'Next Step',
        regRefPrompt: 'If you have a referral code, enter it below; otherwise leave it empty and confirm:',
        btnRegConfirm: 'Confirm & Complete Registration',
        btnSendForgotOtp: 'Send Recovery SMS Code',
        btnResetPassword: 'Save New Password & Sign In',
        changeUserModalTitle: 'Change Username (Once every 24 hours)',
        changeUserPhoneHint: 'For security verification, please confirm your registered mobile phone number to receive an SMS OTP:',
        btnSendChangeOtp: 'Send SMS Code',
        btnVerifyChangeOtp: 'Verify SMS Code',
        btnSaveNewUsername: 'Save New Username',
        phoneVerifyModalTitle: 'Phone Number Verification for Payouts',
        phoneVerifyExplanation: 'Dear user, to protect your financial security, verify account ownership, and enable commission withdrawals to your bank Sheba account, phone verification via SMS is required.',
        btnSendVerifySms: '📩 Send SMS Verification Code',
        btnConfirmPhoneOtp: 'Confirm & Verify Phone',
        phoneVerifiedBadge: '✅ Phone Verified',
        phoneUnverifiedBadge: '⚠️ Unverified',
        btnVerifyPhone: 'Verify Phone',
        txModalTitle: '📊 Wallet Transaction Status',
        txFilterAll: 'All',
        txFilterDeposit: 'Deposits',
        txFilterWithdraw: 'Withdrawals',
        txTimeLabel: 'Period:',
        txTimeAll: 'All Time',
        txTimeDay: 'Today',
        txTimeMonth: 'Last Month',
        txTimeYear: 'Last Year',
        refHelpTitle: '❓ Referral & Earnings Guide',
        refHelpDesc1: 'Our affiliate reward system is structured strictly across two upline tiers: Direct Referrals (Tier 1) 25%, which reaches the 30% Shared Book Bonus every other eligible purchase, and Indirect Referrals (Tier 2) 10%.',
        refHelpDesc2: '<strong>How to Invite:</strong> Simply share your unique invite link with friends or have them enter your referral code upon registration.'
      }
    };

    const allColors = [
      // --- روشن‌های خنثی و کاغذی ---
      '#faf6f0', '#ffffff', '#f8f4ec', '#fffdf5', '#f0f0f2', '#ebe6dd',
      // --- پاستیلی‌های پررنگ‌تر (رنگ واضح و قابل‌تشخیص، ولی نرم و بدون جیغ) ---
      '#f4b8c8', // صورتی گلبهی
      '#f8c4a4', // هلویی
      '#f5dc86', // کره‌ای/لیمویی ملایم
      '#bfe0a4', // سبز پسته‌ای
      '#a9dfc6', // نعنایی
      '#a6dade', // آبی یخی-فیروزه‌ای
      '#b3cdf0', // آبی آسمانی
      '#bcc2f0', // آبی بنفش (پریوینکل)
      '#d0baee', // یاسی
      '#eab8dd', // صورتی-یاسی
      // --- رنگ‌های گرم مخصوص کتاب‌خوانی (کم‌نور آبی، مناسب چشم) ---
      '#f4ecd8', // سپیا (کلاسیک کتاب‌خوان‌ها)
      '#f5e6c4', // کاغذ پوستی روشن
      '#f3e5c8', // کاغذ پوستی
      '#efdcb5', // کاغذ عسلی
      '#f2dbbd', // شنی گرم
      '#e9d2a6', // کاغذ کهربایی
      '#f4e2cf', // کاغذ کتان گرم
      '#fbf1dc', // کاغذ کرم/عاجی
      '#f0e6da', // کاغذ کتان
      '#f1d9a8', // سپیای طلایی (گرم‌تر از سپیای کلاسیک)
      '#ecc9a0', // کاراملی / لاته
      '#f0d2c0', // بژ گلبهی گرم
      '#e6d3b3', // کاغذ کرافت
      '#f6dfae', // زرد کاهی نرم
      '#e8eee2', // سبز ملایم مخصوص آسایش چشم
      // --- تیره‌ها ---
      '#121212', '#0f172a', '#1e293b', '#212529', '#1e272e', 
      '#2b262d', '#222831', '#1f2421', '#0d1b2a', '#1a0f14', '#191424',
      // تم‌های تیره‌ی مناسب مطالعه‌ی شبانه
      '#241c15', // قهوه‌ای اسپرسو (شب سپیا)
      '#13231d', // سبز جنگلی تیره
      '#161b2e', // آبی جوهری
      '#22201c', // زغالی گرم
      '#0f2429'  // سبز‌آبی تیره
    ];

    const authors = window.__PAGE_DATA.authors;

    // کادر چهره‌ها: اگر ادمین عکس گذاشته باشد (پنل ادمین ← کادر چهره‌ها) فقط همان عکس‌ها نمایش داده می‌شوند؛
    // هر کدام به صفحه‌ی نویسنده‌اش لینک است و اسم نویسنده با رفتن موس روی عکس دیده می‌شود.
    // اگر هنوز هیچ عکسی نگذاشته باشد، ردیف پیش‌فرض قدیمی نشان داده می‌شود.
    const featuredAdminItems = window.__PAGE_DATA.featured;
    const featuredDefaultEntities = [
      { id: 'fe1', name: { fa: 'فئودور داستایوفسکی', en: 'Fyodor Dostoevsky' }, type: 'author', authorId: 'au1', image: '', avatarText: '🧔🏻‍♂️', tag: { fa: 'نویسنده', en: 'Author' } },
      { id: 'fe2', name: { fa: 'صادق هدایت', en: 'Sadegh Hedayat' }, type: 'author', authorId: 'au5', image: '', avatarText: '👓', tag: { fa: 'نویسنده', en: 'Author' } },
      { id: 'fe3', name: { fa: 'جورج اورول', en: 'George Orwell' }, type: 'author', authorId: 'au3', image: '', avatarText: '🖋️', tag: { fa: 'نویسنده', en: 'Author' } },
      { id: 'fe4', name: { fa: 'جیمز کلیر', en: 'James Clear' }, type: 'author', authorId: 'au4', image: '', avatarText: '💡', tag: { fa: 'نویسنده', en: 'Author' } },
      { id: 'fe5', name: { fa: 'نشر چشمه', en: 'Cheshmeh Pub' }, type: 'publisher', image: '', avatarText: '🏛️', tag: { fa: 'ناشر همکار', en: 'Publisher' } },
      { id: 'fe6', name: { fa: 'ویکتور فرانکل', en: 'Viktor Frankl' }, type: 'author', authorId: 'au6', image: '', avatarText: '🧠', tag: { fa: 'نویسنده', en: 'Author' } },
      { id: 'fe7', name: { fa: 'نشر نوین', en: 'Novin Pub' }, type: 'publisher', filterName: { fa: 'نشر نوین (همکار رسمی)', en: 'Novin Pub' }, image: '', avatarText: '📚', tag: { fa: 'ناشر همکار', en: 'Publisher' } }
    ];
    // اسم، عکس و لینک هر مورد از خود نویسنده (photoUrl و slug در authors) گرفته می‌شود
    featuredDefaultEntities.forEach(e => {
      const a = e.authorId ? authors.find(x => x.id === e.authorId) : null;
      if (a) { if (a.photoUrl) e.image = a.photoUrl; if (a.slug) e.slug = a.slug; }
    });
    const featuredFromAdmin = featuredAdminItems.map(f => {
          const a = authors.find(x => x.id === f.authorId);
          return a ? { id: 'fe_' + f.id, name: a.name, type: 'author', authorId: a.id, slug: f.slug || a.slug || '', image: f.image || a.photoUrl || '', avatarText: a.avatarEmoji || '✍️', tag: { fa: 'نویسنده', en: 'Author' } } : null;
        }).filter(Boolean);
    const featuredEntities = featuredFromAdmin.length ? featuredFromAdmin : featuredDefaultEntities;

    const GENRE_GROUPS = window.__PAGE_DATA.genreGroups;

    const books = window.__PAGE_DATA.books;

    let currentLang = 'fa';
    // زبان صفحه از روی آدرس تعیین می‌شود (فارسی: آدرس اصلی، انگلیسی: آدرس en-...)؛ سرور مقدارش را می‌گذارد
    window.PAGE_LANG = window.__PAGE_DATA.pageLang;
    window.ALT_LANG_URL = window.__PAGE_DATA.altUrl;
    // دکمه‌ی زبان: به نسخه‌ی دیگر همین صفحه (آدرس جدا) می‌رود تا گوگل هر دو نسخه را ببیند
    function switchPageLanguage() {
      if (window.ALT_LANG_URL) { location.href = window.ALT_LANG_URL; }
      else { toggleLanguage(); }
    }

    // نام برند و عنوان تب مرورگر بر اساس زبان فعلی (فارسی: «PDF مارکت» / انگلیسی: «PDF Market»)
    function brandPlainName() { const t = translations[currentLang]; return t.logoBrand + t.logoAccent; }
    // عنوان پایه‌ی تب: در صفحه‌ی نویسنده عنوان همان نویسنده، در بقیه‌ی صفحات عنوان فروشگاه
    function homeDocTitle() {
      const bookRoot = document.getElementById('bookProduct'); if (bookRoot && bookRoot.dataset.docTitle) return bookRoot.dataset.docTitle;
      
      const grid = document.getElementById('authorBooksCatalog');
      if (grid && typeof authors !== 'undefined') {
        const a = authors.find(x => x.id === grid.dataset.authorId);
        if (a) {
          return currentLang === 'fa'
            ? (a.readingOrder ? `${a.name.fa} | بیوگرافی کامل، ترتیب مطالعه و کتاب‌های PDF | PDF مارکت` : `${a.name.fa} | بیوگرافی کامل و کتاب‌های PDF | PDF مارکت`)
            : (a.readingOrder ? `${a.name.en} | Full Biography, Reading Order & PDF Books | PDF Market` : `${a.name.en} | Full Biography & PDF Books | PDF Market`);
        }
      }
      return translations[currentLang].docTitleHome;
    }

    // عنوان تب مرورگر را با توجه به پنجره‌ی بازِ فعلی و زبان جدید دوباره می‌سازد (هنگام تغییر زبان)
    function refreshDocTitle() {
      const fa = currentLang === 'fa';
      const isOpen = id => { const el = document.getElementById(id); return !!el && el.style.display === 'flex'; };
      const brand = brandPlainName();
      if (isOpen('aboutModal')) document.title = (fa ? 'راهنمای جامع | ' : 'Comprehensive Guide | ') + brand;
      else if (isOpen('cartModal')) document.title = (fa ? 'سبد خرید | ' : 'Your Cart | ') + brand;
      else if (isOpen('userPanelModal')) document.title = (fa ? 'پنل شخصی کاربر | ' : 'My Account | ') + brand;
      else document.title = homeDocTitle();
    }

    // برچسب‌های پنل انتخاب رنگ/تم (که با جاوااسکریپت ساخته می‌شوند) به زبان فعلی
    function applyThemePanelLanguage() {
      const t = translations[currentLang];
      const setText = (el, txt) => { if (el) el.textContent = txt; };
      setText(document.getElementById('themeTabSiteBtn'), t.themeTabSite);
      setText(document.getElementById('themeTabFrameBtn'), t.themeTabFrame);
      const dark = document.querySelector('.theme-cycle-bar.dark-cycle');
      if (dark) { dark.textContent = t.themeDarkRainbow; dark.title = t.themeDarkRainbowTip; }
      const pastel = document.querySelector('.theme-cycle-bar.pastel-cycle');
      if (pastel) { pastel.textContent = t.themePastelRainbow; pastel.title = t.themePastelRainbowTip; }
      const reset = document.querySelector('.spotlight-reset-btn');
      if (reset) { reset.textContent = t.themeResetFrame; reset.title = t.themeResetFrameTip; }
    }
    let currentSpotlight = 0;
    let activeFilter = null;
    let currentBioBookId = null;
    let currentAuthorProfileId = null;
    let spotlightIntervalId = null;
    let currentViewMode = 'grid';

    const INITIAL_FAMOUS_COUNT = 3;
    const LOAD_STEP = 3;
    let displayedCount = INITIAL_FAMOUS_COUNT;
    const RESULT_PAGE_SIZE = 30;      // تعداد کتاب در هر صفحه‌ی نتایج فیلتر/جستجو
    let resultsLimit = RESULT_PAGE_SIZE;
    let lastResultsSig = '';

    let currentActiveUser = null;
    let pendingRegData = null;
    let pendingChangeUserData = null;
    let pendingForgotPasswordData = null;
    let pendingPhoneVerifyData = null;
    let activeReadingInterval = null;
    let activeShelfFilter = 'all';

    let activeTxType = 'all';

    // ---- خواندن امن از حافظه‌ی مرورگر ----
    // اگر مقدار ذخیره‌شده خراب باشد (JSON نامعتبر) یا نوعش اشتباه باشد (مثلاً شیء به‌جای آرایه)،
    // سایت از کار نمی‌افتد و مقدار پیش‌فرض برمی‌گردد. فقط همان یک کلید تحت‌تأثیر است، نه کل حافظه.
    // نسخه‌ای از مقدار خراب هم (یک بار) در کلید «..__corrupt_backup» نگه داشته می‌شود تا چیزی برای همیشه گم نشود.
    function safeParseJSON(raw, fallback, expect) {
      if (raw === null || raw === undefined || raw === '') return fallback;
      try {
        const v = JSON.parse(raw);
        if (expect === 'array') return Array.isArray(v) ? v : fallback;
        if (expect === 'object') return (v && typeof v === 'object' && !Array.isArray(v)) ? v : fallback;
        return v;
      } catch (e) { return fallback; }
    }
    function safeReadStorage(key, fallback, expect) {
      let raw = null;
      try { raw = localStorage.getItem(key); } catch (e) { return fallback; }
      if (raw === null || raw === '') return fallback;
      const NOPE = {};
      const parsed = safeParseJSON(raw, NOPE, expect);
      if (parsed !== NOPE) return parsed;
      try {
        const bk = key + '__corrupt_backup';
        if (localStorage.getItem(bk) === null) localStorage.setItem(bk, raw);
      } catch (e) { /* حافظه پر یا غیرفعال است */ }
      return fallback;
    }

    let cartBookIds = safeReadStorage('pdf_market_cart_ids', [], 'array');
    let savedBookIds = safeReadStorage('pdf_market_saved_books', [], 'array');
    let appliedDiscountPercentage = 0;
    let appliedVoucherCode = null;
    let appliedVoucherBookId = null; // شناسه‌ی کتابی که کد تخفیف فقط برای همان اعمال می‌شود
    let avatarGridItems = [];

    // ===== لایه‌ی امن درخواست اینترنتی =====
    // هر درخواستی که سایت (حالا یا در آینده) بفرستد باید از این‌جا رد شود تا هیچ‌وقت صفحه را قفل یا خراب نکند:
    //  • timeout (هیچ درخواستی بی‌نهایت منتظر نمی‌ماند)   • تلاش مجدد فقط برای GET با تأخیر تصاعدی + تصادفی (جلوگیری از هجوم هم‌زمان به سرور)
    //  • قطع‌کننده‌ی مدار (بعد از چند شکست پشت‌سرهم، مدتی درخواست نمی‌فرستد)   • حداکثر ۴ درخواست هم‌زمان
    //  • ادغام درخواست‌های تکراری و کش کوتاه‌مدت (در قطعی، نسخه‌ی قبلی را برمی‌گرداند)
    //  • هیچ‌وقت exception پرتاب نمی‌کند؛ همیشه { ok, status, data, error } برمی‌گرداند
    const Net = (() => {
      const MAX_CONCURRENT = 4;
      const BREAKER_FAILS = 3;
      const BREAKER_COOLDOWN_MS = 30000;
      let active = 0;
      const waiting = [];
      const inflight = new Map();
      const cache = new Map();
      const breakers = new Map();

      const sleep = (ms) => new Promise(r => setTimeout(r, ms));
      function hostOf(url) {
        try { return new URL(url, location.href).host; } catch (e) { return String(url); }
      }
      function acquire() {
        if (active < MAX_CONCURRENT) { active++; return Promise.resolve(); }
        return new Promise(res => waiting.push(res));
      }
      function release() {
        const next = waiting.shift();
        if (next) next(); else active--;
      }

      async function run(url, o, cacheKey) {
        const host = hostOf(url);
        let br = breakers.get(host);
        if (!br) { br = { fails: 0, openUntil: 0 }; breakers.set(host, br); }
        const stale = cacheKey ? cache.get(cacheKey) : null;
        const staleResult = () => stale ? { ok: true, status: 200, data: stale.data, fromCache: true, stale: true } : null;

        if (Date.now() < br.openUntil) return staleResult() || { ok: false, status: 0, error: 'circuit-open' };
        if (typeof navigator !== 'undefined' && navigator.onLine === false) return staleResult() || { ok: false, status: 0, error: 'offline' };

        await acquire();
        try {
          const maxAttempts = o.isGet ? o.retries + 1 : 1;
          let lastErr = 'unknown', lastStatus = 0, countFail = true;
          for (let attempt = 0; attempt < maxAttempts; attempt++) {
            if (attempt > 0) await sleep(Math.random() * Math.min(4000, 300 * Math.pow(2, attempt)));
            const ctrl = new AbortController();
            const timer = setTimeout(() => ctrl.abort(), o.timeout);
            try {
              const res = await fetch(url, Object.assign({ method: o.method, body: o.body, headers: o.headers, signal: ctrl.signal }, o.init));
              clearTimeout(timer);
              lastStatus = res.status;
              if (res.ok) {
                let data = null;
                if (o.parse === 'json') { try { data = await res.json(); } catch (e) { data = null; } }
                else if (o.parse === 'text') { try { data = await res.text(); } catch (e) { data = null; } }
                br.fails = 0; br.openUntil = 0;
                if (cacheKey && o.cacheTtl > 0) cache.set(cacheKey, { t: Date.now(), data });
                return { ok: true, status: res.status, data };
              }
              lastErr = 'http-' + res.status;
              if (res.status < 500 && res.status !== 429) { countFail = false; break; }   // خطای 4xx: تلاش مجدد بی‌فایده است و مدار را هم نمی‌بندد
            } catch (e) {
              clearTimeout(timer);
              lastErr = (e && e.name === 'AbortError') ? 'timeout' : 'network';
            }
          }
          if (countFail) {
            br.fails++;
            if (br.fails >= BREAKER_FAILS) br.openUntil = Date.now() + BREAKER_COOLDOWN_MS * (0.75 + Math.random() * 0.5);
          }
          return staleResult() || { ok: false, status: lastStatus, error: lastErr };
        } finally {
          release();
        }
      }

      function request(url, opts) {
        const o = Object.assign({ method: 'GET', timeout: 4000, retries: 2, cacheTtl: 0, parse: 'json', init: {} }, opts || {});
        o.isGet = String(o.method).toUpperCase() === 'GET';
        const cacheKey = o.isGet ? url : null;

        if (cacheKey && o.cacheTtl > 0) {
          const hit = cache.get(cacheKey);
          if (hit && Date.now() - hit.t < o.cacheTtl) return Promise.resolve({ ok: true, status: 200, data: hit.data, fromCache: true });
        }
        if (cacheKey && inflight.has(cacheKey)) return inflight.get(cacheKey);

        const job = run(url, o, cacheKey).catch(() => ({ ok: false, status: 0, error: 'unexpected' }));
        if (cacheKey) {
          inflight.set(cacheKey, job);
          job.then(() => inflight.delete(cacheKey));
        }
        return job;
      }
      return { request };
    })();

    // ===== توابع کمکی عمومی =====
    function escapeHtml(str) {
      return String(str == null ? '' : str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    }
    function normalizeDigits(str) {
      return convertPersianDigitsToEnglish(str);
    }
    // برای فیلدهایی مثل رمز عبور ثبت‌نام که باید فقط عدد باشند: همون لحظه‌ی تایپ (چه رقم فارسی/عربی
    // چه انگلیسی)، رقم‌های فارسی/عربی به انگلیسی تبدیل می‌شن و هر کاراکتر غیر رقمی (حرف و غیره) حذف می‌شه.
    function restrictInputToDigits(el) {
      // مقداردهی همزمان و فوری به el.value داخل رویداد input می‌تواند با مکانیزم
      // پرکردن خودکار (Autofill) و پیشنهاد کیبورد اندروید (مثلاً چیپ شماره تلفن) تداخل ایجاد کند
      // و باعث شود لمس پیشنهاد هیچ اثری نداشته باشد. برای جلوگیری از این تداخل، اصلاح مقدار
      // را به فریم بعدی موکول می‌کنیم تا رویداد پرکردن خودکار کاملاً تمام شده باشد.
      requestAnimationFrame(() => {
        const digitsOnly = normalizeDigits(el.value).replace(/[^0-9]/g, '');
        if (el.value !== digitsOnly) {
          const pos = el.selectionStart;
          const lenDiff = el.value.length - digitsOnly.length;
          el.value = digitsOnly;
          try {
            if (typeof pos === 'number') {
              const newPos = Math.max(0, pos - lenDiff);
              el.setSelectionRange(newPos, newPos);
            }
          } catch (e) { /* برخی فیلدها (مثل type=tel در بعضی مرورگرها) از setSelectionRange پشتیبانی نمی‌کنند */ }
        }
      });
    }
    // کلید روز بر اساس ساعت محلی کاربر (نه UTC)
    function getLocalDayKey(d) {
      // «روز» همیشه به وقت تهران است (نیمه‌شب تهران = شروع روز جدید)، مستقل از منطقه‌ی زمانی دستگاه
      const g = getTehranYmd(d || new Date());
      return g.y + '-' + String(g.m).padStart(2, '0') + '-' + String(g.d).padStart(2, '0');
    }
    function formatDayKey(dayKey, locale) {
      const [y, m, d] = dayKey.split('-').map(Number);
      return new Date(y, m - 1, d).toLocaleDateString(locale);
    }
    // نام کاربری: ۳ تا ۲۰ کاراکتر، فقط حروف (فارسی/انگلیسی)، عدد، _ ، . و -
    function isValidUsername(u) {
      return /^[\p{L}\p{N}_.\-]{3,20}$/u.test(u);
    }
    function usernameErrorMsg() {
      return currentLang === 'fa'
        ? '⚠️ نام کاربری باید ۳ تا ۲۰ کاراکتر و فقط شامل حروف، عدد، _ ، . یا - باشد.'
        : '⚠️ Username must be 3–20 characters: letters, numbers, _ . or - only.';
    }

    function getUsersDatabase() {
      // فقط رکوردهای شیء معتبر نگه داشته می‌شوند تا یک ورودی خراب باعث خطا در find/filter نشود
      return safeReadStorage('pdf_market_users_db', [], 'array').filter(u => u && typeof u === 'object');
    }

    let _storageWarned = false;
    function notifyStorageFailure() {
      if (_storageWarned) return;
      _storageWarned = true;
      try {
        alert(currentLang === 'fa'
          ? '⚠️ ذخیره‌ی اطلاعات در مرورگر انجام نشد (حافظه‌ی مرورگر پر است یا حالت خصوصی فعال است). لطفاً فضای مرورگر را خالی کنید یا از حالت عادی مرورگر استفاده کنید و دوباره تلاش کنید.'
          : '⚠️ Could not save data in your browser (storage is full or private mode is on). Please free up space or use a normal browser window and try again.');
      } catch (e) { /* ignore */ }
    }
    function saveUsersDatabase(users) {
      try { localStorage.setItem('pdf_market_users_db', JSON.stringify(users)); return true; }
      catch (e) { notifyStorageFailure(); return false; }
    }

    // =================================================================
    // اتصال Supabase — فقط برای هماهنگی «نام کاربری/شماره/کد معرف یکتا»
    // بین دستگاه‌های مختلف (تست فاز اول). بقیه‌ی اطلاعات (کیف پول، سبد
    // خرید، کتاب‌های خریداری‌شده و...) فعلاً همچنان روی همون مرورگر/
    // دستگاه (localStorage) ذخیره می‌مونه؛ این بخش فقط تضمین می‌کنه که
    // موقع ثبت‌نام/ورود، سایت بتونه کاربرهای ثبت‌شده روی دستگاه‌های
    // دیگه رو هم ببینه.
    // =================================================================
    const SUPABASE_URL = 'https://rpvpzhyxngxqztjcwcss.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_ABJrLcMuFU-OSB0_BHWrRw_cNufmDC0';
    let supabaseClient = null;
    (function loadSupabase() {
      function init() {
        try {
          if (!supabaseClient && window.supabase && window.supabase.createClient) {
            supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
          }
        } catch (e) {}
      }
      if (window.supabase) { init(); return; }
      var sc = document.createElement('script');
      sc.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
      sc.async = true;
      sc.onload = init;
      sc.onerror = function () {};
      document.head.appendChild(sc);
    })();

    // =================================================================
    // قدم امنیتی: احراز هویت واقعی با Supabase Auth (به‌جای ذخیره‌ی رمز
    // به‌صورت متن خام توی جدول users). چون سایت به‌جای ایمیل از «شماره
    // موبایل» استفاده می‌کنه و Supabase Auth ایمیل می‌خواد، برای هر کاربر
    // یک ایمیل ساختگیِ داخلی (که هیچ‌وقت جایی ارسال نمی‌شه) از روی شماره‌ش
    // ساخته می‌شه. خودِ رمز عبور هیچ‌وقت به جدول users فرستاده نمی‌شه؛
    // هش کردن و نگهداری امن رمز کاملاً سمت سرورِ Supabase انجام می‌شه.
    // =================================================================
    function phoneToAuthEmail(phone) {
      return phone + '@users.pdfmarket.internal';
    }

    // تبدیل شیء کاربر (فرمت داخلی سایت) به سطر جدول Supabase
    function userToSupabaseRow(u) {
      return {
        phone: u.phone,
        username: u.username,
        auth_user_id: u.authUserId || null, // لینک به کاربرِ واقعیِ Supabase Auth؛ دیگه رمز اینجا ذخیره نمی‌شه
        reg_timestamp: u.regTimestamp,
        referral_code: u.referralCode,
        referred_by: u.referredBy,
        user_vouchers: u.userVouchers || [],
        wallet: u.wallet || 0,
        total_referrals: u.totalReferrals || 0,
        referral_log: u.referralLog || [],
        phone_verified: !!u.phoneVerified,
        avatar: u.avatar || '👤',
        preferred_lang: u.preferredLang || 'fa',
        reading_logs: u.readingLogs || [],
        purchased_books: u.purchasedBooks || []
      };
    }

    // تبدیل سطر Supabase به فرمت داخلی سایت
    function supabaseRowToUser(r) {
      return {
        phone: r.phone,
        username: r.username,
        authUserId: r.auth_user_id || null,
        regTimestamp: r.reg_timestamp,
        referralCode: r.referral_code,
        referredBy: r.referred_by,
        userVouchers: r.user_vouchers || [],
        wallet: r.wallet || 0,
        totalReferrals: r.total_referrals || 0,
        referralLog: r.referral_log || [],
        phoneVerified: !!r.phone_verified,
        avatar: r.avatar || '👤',
        preferredLang: r.preferred_lang || 'fa',
        readingLogs: r.reading_logs || [],
        purchasedBooks: r.purchased_books || [], readingProgress: r.reading_progress || {}
      };
    }

    // ---- دسترسی امن به جدول users (با قفل RLS روشن) ----
    // بدون ورود، هیچ سطری از جدول users خونده نمی‌شه. برای کارهای قبل از ورود
    // (چک تکراری بودن، پیدا کردن شماره از روی نام کاربری، اعتبارسنجی کد معرف)
    // از توابع امن سمت سرور (RPC) استفاده می‌کنیم که فقط حداقل اطلاعات برمی‌گردونن.
    // این توابع یک شیء «ناقص» (partial: true) برمی‌گردونن، نه پروفایل کامل.
    async function supaHasSession() {
      if (!supabaseClient) return false;
      try {
        const { data } = await supabaseClient.auth.getSession();
        return !!(data && data.session);
      } catch (e) {
        return false;
      }
    }

    // جست‌وجوی یک کاربر با شماره یا نام کاربری (هرکدوم پر باشه)
    async function supaFindUser({ phone, username }) {
      if (!supabaseClient) return null;
      try {
        // کاربرِ واردشده: فقط سطر خودش قابل خوندنه (RLS) → پروفایل کامل
        if (phone && !username && await supaHasSession()) {
          const own = await supabaseClient.from('users').select('*').eq('phone', phone).limit(1);
          if (!own.error && own.data && own.data.length) return supabaseRowToUser(own.data[0]);
        }

        // فقط نام کاربری → شماره‌ی مربوطه (برای ورود با نام کاربری)
        if (username && !phone) {
          const { data, error } = await supabaseClient.rpc('get_phone_by_username', { p_username: username });
          if (error) { console.error('Supabase error:', error); return null; }
          return data ? { partial: true, phone: data, username: username } : null;
        }

        // شماره (و/یا نام کاربری) → فقط «ثبت شده یا نه»
        if (phone || username) {
          const { data, error } = await supabaseClient.rpc('check_user_exists', {
            p_phone: phone || null,
            p_username: username || null
          });
          if (error) { console.error('Supabase error:', error); return null; }
          if (data && data.phone_taken) return { partial: true, phone: phone, username: username || null };
          if (data && data.username_taken) return { partial: true, phone: null, username: username };
        }
        return null;
      } catch (e) {
        console.error('Supabase connection error:', e);
        return null;
      }
    }

    // اعتبارسنجی کد معرف: فقط نام کاربری و خودِ کد برمی‌گرده (نه شماره/کیف پول)
    async function supaFindUserByReferralCode(code) {
      if (!supabaseClient || !code) return null;
      try {
        const { data, error } = await supabaseClient.rpc('lookup_referral_code', { p_code: code });
        if (error) { console.error('Supabase error:', error); return null; }
        const row = Array.isArray(data) ? data[0] : data;
        if (!row || !row.referral_code) return null;
        return {
          partial: true,
          phone: null,
          username: row.username,
          referralCode: row.referral_code,
          totalReferrals: 0,
          referralLog: []
        };
      } catch (e) {
        console.error('Supabase connection error:', e);
        return null;
      }
    }

    // ثبت پروفایل کاربر در جدول users. تا ۳ بار تلاش می‌کنه و فقط وقتی واقعاً ذخیره
    // شده باشه true برمی‌گردونه (قبلاً خطا بی‌صدا رد می‌شد و ثبت‌نام نصفه می‌موند).
    async function supaInsertUser(u, attempts = 3) {
      if (!supabaseClient) return false;
      for (let i = 1; i <= attempts; i++) {
        try {
          const { error } = await supabaseClient.from('users').insert(userToSupabaseRow(u));
          if (!error) return true;
          // ردیف همین شماره از قبل هست (مثلاً تلاش قبلی در واقع ذخیره شده بود) → موفق حساب می‌شه
          if (error.code === '23505') {
            const own = await supabaseClient.from('users').select('phone').eq('phone', u.phone).limit(1);
            if (!own.error && own.data && own.data.length) return true;
          }
          console.error('Supabase insert error (attempt ' + i + '):', error);
        } catch (e) {
          console.error('Supabase connection error (attempt ' + i + '):', e);
        }
        if (i < attempts) await new Promise(r => setTimeout(r, 700 * i));
      }
      return false;
    }

    // اطلاعات غیرحساس پروفایل که موقع ثبت‌نام داخل خودِ حساب ورود (user_metadata) هم
    // نگه‌داری می‌شه تا اگه ساخت ردیف جدول نصفه ماند، موقع ورود ترمیم شود.
    // (کیف پول، کوپن‌ها و شمارنده‌ها از اینجا خوانده نمی‌شوند.)
    function buildProfileMetadata(p) {
      return {
        profile: {
          username: p.username,
          regTimestamp: p.regTimestamp,
          referralCode: p.referralCode,
          referredBy: p.referredBy || null,
          preferredLang: p.preferredLang || 'fa'
        }
      };
    }

    // خودترمیمی موقع ورود: رمز درست بود ولی پروفایل توی جدول users نبود.
    // اول از نسخه‌ی محلی همین دستگاه (اگه باشه)، وگرنه از user_metadata حساب می‌سازیم.
    async function supaRepairProfile(authUser, phone) {
      if (!authUser) return null;
      let u = getUsersDatabase().find(x => x.phone === phone) || null;
      if (u) {
        u = Object.assign({}, u, { authUserId: authUser.id });
      } else {
        const p = authUser.user_metadata && authUser.user_metadata.profile;
        if (!p || typeof p.username !== 'string') return null;
        const username = p.username.trim().toLowerCase();
        if (!isValidUsername(username)) return null;
        let referredBy = null;
        if (p.referredBy) {
          const r = await supaFindUserByReferralCode(String(p.referredBy));
          if (r && r.referralCode) referredBy = r.referralCode.toUpperCase();
        }
        const ts = Number(p.regTimestamp) > 0 ? Number(p.regTimestamp) : Date.now();
        const refCode = (typeof p.referralCode === 'string' && /^REF-[A-Z0-9_-]+$/i.test(p.referralCode))
          ? p.referralCode
          : 'REF-' + username.toUpperCase() + '-' + Math.floor(100 + Math.random() * 900);
        const lang = p.preferredLang === 'en' ? 'en' : 'fa';
        u = {
          phone: phone,
          username: username,
          authUserId: authUser.id,
          regTimestamp: ts,
          referralCode: refCode,
          referredBy: referredBy,
          userVouchers: generateUniqueVouchers(username),
          wallet: 0,
          totalReferrals: 0,
          phoneVerified: false,
          avatar: '👤',
          preferredLang: lang,
          readingLogs: [
            { date: new Date(ts).toLocaleDateString(lang === 'fa' ? 'fa-IR' : 'en-US'), dayKey: getLocalDayKey(new Date(ts)), minutes: 0 }
          ],
          purchasedBooks: []
        };
      }
      const ok = await supaInsertUser(u);
      return ok ? u : null;
    }

    // اگر کاربری روی این دستگاه نبود ولی روی Supabase پیدا شد، یک نسخه از او
    // را در دیتابیس محلی همین مرورگر هم اضافه می‌کند تا بقیه‌ی بخش‌های سایت
    // (که فعلاً روی localStorage کار می‌کنند) او را بشناسند.
    function mergeRemoteUserIntoLocal(remoteUser) {
      if (remoteUser && remoteUser.partial) return remoteUser;
      if (!remoteUser || !remoteUser.phone) return remoteUser;
      const users = getUsersDatabase();
      const idx = users.findIndex(u => u.phone === remoteUser.phone);
      if (idx === -1) {
        users.push(remoteUser);
        saveUsersDatabase(users);
        return remoteUser;
      }
      const localBooks = users[idx].purchasedBooks || [];
      const localProgress = users[idx].readingProgress || {};
      const merged = Object.assign({}, users[idx]);
      Object.keys(remoteUser).forEach(k => { if (remoteUser[k] !== undefined) merged[k] = remoteUser[k]; });
      merged.purchasedBooks = mergePurchasedBooks(localBooks, remoteUser.purchasedBooks);
      merged.readingProgress = mergeReadingProgress(localProgress, remoteUser.readingProgress);
      users[idx] = merged;
      saveUsersDatabase(users);
      return merged;
    }

    function copyToClipboard(text, btnElement) {
      navigator.clipboard.writeText(text).then(() => {
        const origText = btnElement.textContent;
        btnElement.textContent = currentLang === 'fa' ? 'کپی شد!' : 'Copied!';
        setTimeout(() => { btnElement.textContent = origText; }, 1800);
      });
    }

    function generateUniqueVouchers(username) {
      return [
        { labelFa: 'خرید اول (۵۰٪):', labelEn: '1st Purchase (50%):', code: generateVoucherCode('OFF50'), percent: 50 },
        { labelFa: 'خرید دوم (۴۰٪):', labelEn: '2nd Purchase (40%):', code: generateVoucherCode('OFF40'), percent: 40 },
        { labelFa: 'خرید سوم (۳۰٪):', labelEn: '3rd Purchase (30%):', code: generateVoucherCode('OFF30'), percent: 30 },
        { labelFa: 'خرید چهارم (۲۰٪):', labelEn: '4th Purchase (20%):', code: generateVoucherCode('OFF20'), percent: 20 },
        { labelFa: 'خرید پنجم (۱۰٪):', labelEn: '5th Purchase (10%):', code: generateVoucherCode('OFF10'), percent: 10 }
      ];
    }

    // پایداری نشست کاربری و نمایش اولیه کتاب‌ها بدون نیاز به دکمه اضافی
    function initUserAuthState() {
      invalidateSpecialDealsCache();
      enforceMonthlyChampionState(); // هر بار قبل از نمایش وضعیت کاربر، رتبه‌ی ماهانه‌ی چالش «آواتار اختصاصی» بررسی می‌شود
      let sessionUser = localStorage.getItem('pdf_market_active_session');
      // نشست فقط یک کپی است و دیتابیس منبع اصلی؛ هر بار از دیتابیس تازه می‌شود (مثلاً شمارش زیرمجموعه‌ها یا کوپن‌ها قدیمی نماند)
      if (sessionUser) {
        const sessionObjCheck = safeParseJSON(sessionUser, null, 'object');
        const sessionPhone = sessionObjCheck ? sessionObjCheck.phone : null;
        const dbUser = sessionPhone ? getUsersDatabase().find(u => u.phone === sessionPhone) : null;
        if (dbUser) {
          sessionUser = JSON.stringify(dbUser);
          localStorage.setItem('pdf_market_active_session', sessionUser);
        } else {
          // کاربر دیگر در دیتابیس نیست؛ نشست نامعتبر است
          localStorage.removeItem('pdf_market_active_session');
          sessionUser = null;
        }
      }
      const loginBtn = document.getElementById('headerLoginBtn');
      const panelBtn = document.getElementById('headerUserPanelBtn');
      const panelNameBtn = document.getElementById('userPanelNameBtn');

      updateCartBadge();

      if (sessionUser) {
        currentActiveUser = safeParseJSON(sessionUser, null, 'object');
        loginBtn.style.display = 'none';
        { const cb = document.getElementById('headerContestBtn'); if (cb) cb.style.display = 'none'; }
        panelBtn.style.display = 'inline-flex';
        panelNameBtn.textContent = currentActiveUser.username;

        document.getElementById('panelUserUsername').textContent = currentActiveUser.username;
        document.getElementById('panelUserPhone').textContent = (currentLang === 'fa' ? 'شماره: ' : 'Phone: ') + currentActiveUser.phone;

        const avatarDisp = document.getElementById('userAvatarDisplay');
        const avatarWrapperEl = avatarDisp.closest('.profile-avatar-wrapper');
        if (avatarWrapperEl) avatarWrapperEl.classList.remove('avatar-diamond-active', 'avatar-crown-active', 'has-photo');
        if (currentActiveUser.pendingAvatarImage && (!currentActiveUser.avatar || currentActiveUser.avatar === '⏳')) {
          // تا وقتی مدیر تایید نکرده، اگر کاربر آواتار دیگری انتخاب نکرده، آواتار موقت نشون داده می‌شه؛
          // اگر کاربر در این فاصله آواتار دیگری انتخاب کرده، همان نمایش داده می‌شود (شاخه‌های پایین)
          avatarDisp.innerHTML = '⏳';
        } else if (currentActiveUser.avatar) {
          if (currentActiveUser.avatar.startsWith('data:image') || currentActiveUser.avatar.startsWith('http')) {
            avatarDisp.innerHTML = `<img src="${escapeHtml(currentActiveUser.avatar)}" alt="Avatar">`;
            if (avatarWrapperEl) avatarWrapperEl.classList.add('has-photo');
          } else if (currentActiveUser.avatar === '✨' || currentActiveUser.avatar === '⏳') {
            avatarDisp.innerHTML = `<span>${escapeHtml(currentActiveUser.avatar)}</span>`;
          } else {
            avatarDisp.innerHTML = avatarImgHtml(currentActiveUser.avatar);
            // ایموجی شخصیت‌ها has-photo نمی‌گیرن تا ظاهر حبابی حفظ بشه؛ فقط عکس آپلودی has-photo داره
            // فقط آخرین آواتار (سید) روی پروفایل هم می‌چرخد؛ پو ثابت است ولی قاب طلایی‌اش را می‌گیرد
            if (avatarWrapperEl && currentActiveUser.avatar === 'Luna') avatarWrapperEl.classList.add('avatar-diamond-active');
            if (avatarWrapperEl && currentActiveUser.avatar === 'Emi') avatarWrapperEl.classList.add('avatar-crown-active');
          }
        } else {
          avatarDisp.innerHTML = '👤';
        }

        const verifyBadge = document.getElementById('panelPhoneVerifyBadge');
        const verifyBtn = document.getElementById('btnVerifyPhoneTrigger');
        const t = translations[currentLang];

        if (currentActiveUser.phoneVerified) {
          verifyBadge.className = 'phone-verify-badge verified';
          verifyBadge.textContent = t.phoneVerifiedBadge;
          verifyBtn.style.display = 'none';
        } else {
          verifyBadge.className = 'phone-verify-badge unverified';
          verifyBadge.textContent = t.phoneUnverifiedBadge;
          verifyBtn.style.display = 'inline-block';
          verifyBtn.textContent = t.btnVerifyPhone;
        }

        if (!currentActiveUser.regTimestamp) {
          currentActiveUser.regTimestamp = Date.now();
          localStorage.setItem('pdf_market_active_session', JSON.stringify(currentActiveUser));
        }
        const regDateObj = new Date(currentActiveUser.regTimestamp);
        if (currentLang === 'fa') {
          const dateFormatted = regDateObj.toLocaleDateString('fa-IR') + ' ساعت ' + regDateObj.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
          document.getElementById('panelRegisterDate').textContent = `تاریخ عضویت: ${dateFormatted}`;
        } else {
          const dateFormatted = regDateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
          document.getElementById('panelRegisterDate').textContent = `Member since: ${dateFormatted}`;
        }

        const currUnit = currentLang === 'fa' ? 'تومان' : 'Toman';
        document.getElementById('panelUserWallet').textContent = `${(currentActiveUser.wallet||0).toLocaleString()} ${currUnit}`;

        syncPendingReading();   // مطالعه‌ی آفلاین (اگر الان آنلاین است) قبل از نمایش مجموع در حساب ثبت می‌شود
        const totalMinutes = (currentActiveUser.readingLogs || []).reduce((acc, log) => acc + log.minutes, 0);
        if (currentLang === 'fa') {
          document.getElementById('panelTotalReadingDisplay').textContent = `${totalMinutes} دقیقه (${(totalMinutes/60).toFixed(1)} ساعت)`;
        } else {
          document.getElementById('panelTotalReadingDisplay').textContent = `${totalMinutes} Mins (${(totalMinutes/60).toFixed(1)} Hours)`;
        }
        renderReadingPendingNote();
        checkChampionEndNotice();   // یک روز مانده به پایان ماه، فقط برای دارنده‌ی عنوان همین ماه
        renderChampionCards();      // کادر «پیام از مدیریت» و کادر عمومی رقابت

        const totalRefs = currentActiveUser.totalReferrals || 0;
        document.getElementById('panelTotalReferralsCount').textContent = `${totalRefs} ${currentLang === 'fa' ? 'نفر' : 'Users'}`;
        const progressInBatch = totalRefs % 10;
        document.getElementById('panelReferralProgressText').textContent = `${progressInBatch} ${currentLang === 'fa' ? 'از ۱۰ نفر' : 'of 10'}`;
        document.getElementById('panelReferralProgressBar').style.width = `${(progressInBatch / 10) * 100}%`;

        // پله‌ی ۱۰تایی فعلی (۱۰، ۲۰، ۳۰، ...) — اگر کاربر از پله عبور کرده باشد (مثلاً ۹ → ۱۱) پاداش نمی‌سوزد
        const currentMilestone = Math.floor(totalRefs / 10) * 10;
        if (currentMilestone > 0 && currentMilestone > (currentActiveUser.lastMilestoneRewarded || 0)) {
          currentActiveUser.lastMilestoneRewarded = currentMilestone;
          const newCode = generateVoucherCode('TIER');
          if (!Array.isArray(currentActiveUser.userVouchers)) currentActiveUser.userVouchers = [];
          // طبق قانون سایت، نمی‌شه دو کوپن با درصد یکسان هم‌زمان داشت؛ کوپن هم‌درصد قبلی (اگه بود) حذف می‌شه
          currentActiveUser.userVouchers = currentActiveUser.userVouchers.filter(v => v.percent !== 20);
          currentActiveUser.userVouchers.push({
            labelFa: `پاداش دعوت ${currentMilestone} نفر (۲۰٪):`,
            labelEn: `Tier Reward (${currentMilestone} Users - 20%):`,
            code: newCode,
            percent: 20
          });
          saveUsersDatabase(getUsersDatabase().map(u => u.phone === currentActiveUser.phone ? currentActiveUser : u));
          localStorage.setItem('pdf_market_active_session', JSON.stringify(currentActiveUser));
        }

        const refCode = currentActiveUser.referralCode || ('REF-' + currentActiveUser.phone.slice(-4));
        document.getElementById('referralCodeInput').value = refCode;
        document.getElementById('referralLinkInput').value = `${window.location.origin}${window.location.pathname}?ref=${refCode}`;

        // پنج کوپن اولیه فقط هنگام ساخت پروفایل صادر می‌شوند.
        // آرایه‌ی خالی یعنی کوپن‌ها مصرف شده‌اند؛ ورود/رفرش نباید آن‌ها را دوباره بسازد.
        // برای حساب قدیمی با فیلد مفقود/نامعتبر نیز فقط آرایه‌ی خالی ذخیره می‌شود.
        if (!Array.isArray(currentActiveUser.userVouchers)) {
          currentActiveUser.userVouchers = [];
          localStorage.setItem('pdf_market_active_session', JSON.stringify(currentActiveUser));
          const users = getUsersDatabase();
          const uIdx = users.findIndex(u => u.phone === currentActiveUser.phone);
          if (uIdx !== -1) {
            users[uIdx].userVouchers = currentActiveUser.userVouchers;
            saveUsersDatabase(users);
          }
        }
        renderUserVouchers();
        renderUserShelf();
        renderReadingHistoryChart();
      } else {
        currentActiveUser = null;
        loginBtn.style.display = 'inline-flex';
        { const cb = document.getElementById('headerContestBtn'); if (cb) cb.style.display = 'inline-flex'; }
        panelBtn.style.display = 'none';
      }
          refreshDealViews();
    }

    function updateSavedBooksBadge() {
      const badge = document.getElementById('savedBooksCount');
      if (!badge) return;
      const n = savedBookIds.length;
      if (n > 0) {
        badge.textContent = n.toLocaleString(currentLang === 'fa' ? 'fa-IR' : 'en-US');
        badge.style.display = 'inline-flex';
      } else {
        badge.textContent = '';
        badge.style.display = 'none';
      }
    }

    function toggleSaveBook(bookId) {
      const idx = savedBookIds.indexOf(bookId);
      if (idx !== -1) {
        savedBookIds.splice(idx, 1);
        alert(currentLang === 'fa' ? '🔖 کتاب از لیست ذخیره‌شده‌ها حذف شد.' : '🔖 Book removed from saved list.');
      } else {
        savedBookIds.push(bookId);
        alert(currentLang === 'fa' ? '🔖 کتاب به لیست ذخیره‌شده‌ها اضافه شد.' : '🔖 Book saved for later.');
      }
      localStorage.setItem('pdf_market_saved_books', JSON.stringify(savedBookIds));
      updateSavedBooksBadge();
      refreshBookSaveBtn();
      if (document.getElementById('booksCatalog')) {
        handleSmartSearch();
        updateSpotlight();
      }
    }

    function openSavedBooksModal() {
      const container = document.getElementById('savedBooksListContainer');
      const t = translations[currentLang];
      document.getElementById('savedBooksModal').style.display = 'flex';
      document.getElementById('savedClearAllBtn').style.display = savedBookIds.length > 0 ? 'block' : 'none';

      if (savedBookIds.length === 0) {
        container.innerHTML = `<div style="text-align:center; color:var(--text-muted); padding:20px;">${t.emptySaved}</div>`;
        return;
      }

      const savedList = books.filter(b => savedBookIds.includes(b.id));
      container.innerHTML = savedList.map(b => `
        <div class="transaction-card-item">
          <div style="display:flex; align-items:center; gap:10px;">${bookThumbHtml(b)}<div>
            <strong style="display:block; font-size:0.9rem;">${b.title[currentLang]}</strong>
            <span style="font-size:0.75rem; color:var(--text-muted);">${b.author[currentLang]} | ${bookPayPrice(b).toLocaleString()} ${t.currency}</span>
          </div></div>
          <div style="display:flex; gap:6px;">
            <button class="btn-copy-code" style="padding:6px 10px;" onclick="addToCart('${b.id}'); closeSavedBooksModal(); openCartModal();">${t.btnBuy}</button>
            <button class="btn-tool" style="padding:4px 8px; color:var(--primary); border-color:var(--primary);" onclick="toggleSaveBook('${b.id}'); openSavedBooksModal();">✕</button>
          </div>
        </div>
      `).join('');
    }

    function clearAllSavedBooks() {
      if (savedBookIds.length === 0) return;
      if (!confirm(translations[currentLang].confirmClearSaved)) return;
      savedBookIds = [];
      localStorage.removeItem('pdf_market_saved_books');
      updateSavedBooksBadge();
      handleSmartSearch();
      updateSpotlight();
      openSavedBooksModal();
    }

    function closeSavedBooksModal() {
      document.getElementById('savedBooksModal').style.display = 'none';
    }

    function addToCart(bookId) {
      const b = books.find(item => item.id === bookId);
      if (!b) return;

      if (currentActiveUser && (currentActiveUser.purchasedBooks || []).some(pb => pb.id === b.id)) {
        alert(currentLang === 'fa' ? '📚 این کتاب را قبلاً خریده‌اید و در قفسه شخصی شما موجود است.' : '📚 You already own this book; it is in your shelf.');
        return;
      }

      if (!cartBookIds.includes(bookId)) {
        cartBookIds.push(bookId);
        localStorage.setItem('pdf_market_cart_ids', JSON.stringify(cartBookIds));
        updateCartBadge();

        if (appliedVoucherCode && cartBookIds.length > 1 && !getBookDeal(bookId)) {
          // اصلاح: کد تخفیف دیگر حذف نمی‌شود؛ فقط همچنان مختص همان کتابی می‌ماند که رویش اعمال شده بود
          alert(currentLang === 'fa'
            ? '🛒 کتاب به سبد خرید اضافه شد. ℹ️ کد تخفیف اعمال‌شده فقط برای همان کتاب اول محاسبه می‌شود؛ این کتاب با قیمت کامل حساب خواهد شد.'
            : '🛒 Book added to shopping cart. ℹ️ Your applied discount code only counts toward the first book; this book will be charged at full price.');
        } else if (getBookDeal(bookId)) {
          alert(currentLang === 'fa' ? '🛒 کتاب با قیمت «تخفیف ویژه» به سبد اضافه شد. ℹ️ کد تخفیف روی کتاب‌های تخفیفات ویژه اعمال نمی‌شود.' : '🛒 Book added to your cart at its Special Discount price. ℹ️ Discount codes do not apply to Special Discount books.');
        } else {
          alert(currentLang === 'fa' ? '🛒 کتاب به سبد خرید اضافه شد.' : '🛒 Book added to shopping cart.');
        }
      } else {
        alert(currentLang === 'fa' ? '⚠️ این کتاب قبلاً به سبد خرید اضافه شده است.' : '⚠️ This book is already in your cart.');
      }
    }

    function removeFromCart(bookId) {
      cartBookIds = cartBookIds.filter(id => id !== bookId);
      localStorage.setItem('pdf_market_cart_ids', JSON.stringify(cartBookIds));
      updateCartBadge();

      // اصلاح: اگر کتابی که کد تخفیف مخصوص همان بود از سبد حذف شود، کد تخفیف هم غیرفعال می‌شود
      if (appliedVoucherCode && bookId === appliedVoucherBookId) {
        appliedVoucherCode = null;
        appliedVoucherBookId = null;
        appliedDiscountPercentage = 0;
        const feedbackEl = document.getElementById('cartVoucherFeedback');
        const inputEl = document.getElementById('cartVoucherInput');
        if (feedbackEl) feedbackEl.textContent = '';
        if (inputEl) inputEl.value = '';
      }

      renderCartModalContent();
    }

    function updateCartBadge() {
      document.getElementById('cartCountBadge').textContent = cartBookIds.length;
    }

    // اصلاح باگ: حذف کتاب‌هایی که کاربر از قبل مالک آنهاست ولی به هر دلیلی (مثلاً قبل از ورود به حساب) هنوز در سبد باقی مانده‌اند
    function sanitizeCartForActiveUser() {
      if (!currentActiveUser) return false;
      const ownedIds = (currentActiveUser.purchasedBooks || []).map(pb => pb.id);
      const initialCount = cartBookIds.length;
      cartBookIds = cartBookIds.filter(id => !ownedIds.includes(id));
      if (cartBookIds.length !== initialCount) {
        localStorage.setItem('pdf_market_cart_ids', JSON.stringify(cartBookIds));
        updateCartBadge();
        return true; // یعنی کتاب تکراری/قبلاً خریداری‌شده وجود داشت و حذف شد
      }
      return false;
    }

    // کلید مشترک برای یادآوری «کدام مودال باز بوده» در sessionStorage. عمداً از تاریخچه‌ی
    // مرورگر (history.pushState/hash) استفاده نمی‌کنیم چون رفتار مرورگرهای مختلف موقع رفرش
    // کردن صفحاتی که با pushState ساخته شدن یکسان نیست و می‌تونه باعث گیر کردن کاربر توی
    // تاریخچه بشه (نیاز به چند بار زدن دکمه‌ی برگشت). sessionStorage با رفرش پاک نمی‌شه ولی
    // هیچ ورودی‌ای هم به تاریخچه‌ی مرورگر اضافه نمی‌کنه، پس روی همه‌ی مرورگرها یکسان و مطمئنه.
    const OPEN_MODAL_KEY = 'pdf_market_open_modal';

    function rememberOpenModal(value) {
      try { sessionStorage.setItem(OPEN_MODAL_KEY, value); } catch (e) {}
    }
    function forgetOpenModal(expectedValue) {
      try {
        if (!expectedValue || sessionStorage.getItem(OPEN_MODAL_KEY) === expectedValue) {
          sessionStorage.removeItem(OPEN_MODAL_KEY);
        }
      } catch (e) {}
    }

    function openCartModal(fromRestore) {
      // اصلاح باگ: کتاب‌های قبلاً خریداری‌شده قبل از نمایش فاکتور و محاسبه تخفیف از سبد خارج می‌شوند
      const removedDuplicates = sanitizeCartForActiveUser();
      appliedDiscountPercentage = 0;
      appliedVoucherCode = null;
      appliedVoucherBookId = null;
      document.getElementById('cartVoucherInput').value = '';
      document.getElementById('cartVoucherFeedback').textContent = '';
      renderCartModalContent();
      document.getElementById('cartModal').style.display = 'flex';
      if (removedDuplicates) {
        alert(currentLang === 'fa'
          ? 'ℹ️ کتاب(هایی) که قبلاً خریداری کرده بودید به‌طور خودکار از سبد خرید حذف شدند.'
          : 'ℹ️ Book(s) you already own were automatically removed from your cart.');
      }
      if (!fromRestore) rememberOpenModal('cart');
      document.title = (currentLang === 'fa' ? 'سبد خرید | ' : 'Your Cart | ') + brandPlainName();
    }

    function closeCartModal() {
      document.getElementById('cartModal').style.display = 'none';
      forgetOpenModal('cart');
      document.title = homeDocTitle();
    }

    function applyCartVoucher() {
      const t = translations[currentLang];
      const feedback = document.getElementById('cartVoucherFeedback');
      const codeInput = document.getElementById('cartVoucherInput').value.trim();

      if (!currentActiveUser || !currentActiveUser.userVouchers) {
        feedback.style.color = '#c95c5c';
        feedback.textContent = currentLang === 'fa' ? '❌ ابتدا باید وارد حساب کاربری خود شوید.' : '❌ Please log in to your account first.';
        return;
      }

      // اصلاح: هر کد تخفیف فقط برای یک کتاب معتبر است؛ اگر بیش از یک کتاب در سبد باشد، کد اعمال نمی‌شود
      sanitizeCartForActiveUser();
      const currentCartBooksForVoucher = cartBookIds.map(id => books.find(b => b.id === id)).filter(Boolean);
      if (currentCartBooksForVoucher.length === 0) {
        feedback.style.color = '#c95c5c';
        feedback.textContent = currentLang === 'fa'
          ? '❌ سبد خرید خالی است. ابتدا یک کتاب اضافه کنید.'
          : '❌ Your cart is empty. Please add a book first.';
        return;
      }
      // کتاب‌های «تخفیفات ویژه» کد تخفیف نمی‌گیرند؛ کد فقط روی یک کتابِ عادی (غیر ویژه) اعمال می‌شود
      const voucherCandidates = currentCartBooksForVoucher.filter(b => !getBookDeal(b.id));
      if (voucherCandidates.length === 0) {
        feedback.style.color = '#c95c5c';
        feedback.textContent = currentLang === 'fa'
          ? '❌ کد تخفیف روی کتاب‌های «تخفیفات ویژه» اعمال نمی‌شود؛ این کتاب‌ها از قبل قیمت تخفیف‌خورده دارند.'
          : '❌ Discount codes cannot be used on Special Discount books; they already have a reduced price.';
        return;
      }
      if (voucherCandidates.length > 1) {
        feedback.style.color = '#c95c5c';
        feedback.textContent = currentLang === 'fa'
          ? '❌ کد تخفیف فقط برای خرید یک کتاب قابل استفاده است. لطفاً کتاب‌های اضافی را از سبد حذف کنید.'
          : '❌ This discount code can only be used for a single book. Please remove the extra books from your cart.';
        return;
      }

      const vFound = findVoucherInList(currentActiveUser.userVouchers, codeInput);
      if (vFound) {
        appliedDiscountPercentage = vFound.percent || 10;
        appliedVoucherCode = vFound.code;
        appliedVoucherBookId = voucherCandidates[0].id; // کد فقط برای همین کتاب معتبر می‌ماند
        feedback.style.color = '#27ae60';
        feedback.textContent = t.voucherSuccess;
        renderCartModalContent();
      } else {
        feedback.style.color = '#c95c5c';
        feedback.textContent = t.voucherError;
      }
    }

    function renderCartModalContent() {
      const container = document.getElementById('cartItemsContainer');
      const totalValElem = document.getElementById('cartTotalPriceVal');
      const oldPriceElem = document.getElementById('cartOldPriceVal');
      const t = translations[currentLang];

      // اطلاعات زنده و به‌روز کتاب‌ها همیشه از آرایه اصلی books خوانده می‌شود
      const currentCartBooks = cartBookIds.map(id => books.find(b => b.id === id)).filter(Boolean);

      if (currentCartBooks.length === 0) {
        container.innerHTML = `<div style="text-align:center; color:var(--text-muted); padding:24px;">${t.emptyCart}</div>`;
        totalValElem.textContent = `0 ${t.currency}`;
        oldPriceElem.style.display = 'none';
        return;
      }

      let totalPrice = 0;
      let discountedTotal = 0;
      container.innerHTML = currentCartBooks.map(b => {
        totalPrice += b.totalPrice;
        const dealInfo = getBookDeal(b.id);
        const isDiscountedBook = !dealInfo && appliedVoucherCode && appliedDiscountPercentage > 0 && b.id === appliedVoucherBookId;
        const linePrice = dealInfo ? dealInfo.price : (isDiscountedBook ? Math.round(b.totalPrice * (1 - appliedDiscountPercentage / 100)) : b.totalPrice);
        discountedTotal += linePrice;
        const priceLabel = (isDiscountedBook || dealInfo)
          ? `<s style="opacity:0.6;">${b.totalPrice.toLocaleString()}</s> ${linePrice.toLocaleString()} ${t.currency} 🏷️`
          : `${b.totalPrice.toLocaleString()} ${t.currency}`;
        return `
          <div class="cart-item-card">
            <div style="display:flex; align-items:center; gap:8px;">
              <button class="btn-tool" style="padding:4px 8px; font-size:0.75rem;" onclick="openBookBio('${b.id}')" title="${currentLang === 'fa' ? 'مشاهده اطلاعات کتاب' : 'View book info'}">🔍</button>
              ${bookThumbHtml(b)}<div>
                <strong style="display:block; font-size:0.9rem;">${b.title[currentLang]}</strong>
                <span style="font-size:0.75rem; color:var(--text-muted);">${b.author[currentLang]} - ${priceLabel}</span>
              </div>
            </div>
            <button class="btn-tool" style="padding:4px 8px; color:var(--primary); border-color:var(--primary);" onclick="removeFromCart('${b.id}')">✕</button>
          </div>
        `;
      }).join('');

      if (discountedTotal !== totalPrice) {
        oldPriceElem.style.display = 'inline';
        oldPriceElem.textContent = `${totalPrice.toLocaleString()} ${t.currency}`;
        totalValElem.textContent = `${discountedTotal.toLocaleString()} ${t.currency}`;
      } else {
        oldPriceElem.style.display = 'none';
        totalValElem.textContent = `${totalPrice.toLocaleString()} ${t.currency}`;
      }
    }

    let pendingCheckoutAfterAuth = false;

    function checkoutCart() {
      if (cartBookIds.length === 0) return;
      const t = translations[currentLang];

      // کاربر مهمان نمی‌تواند خرید را نهایی کند (کتابی به قفسه‌اش اضافه نمی‌شد ولی پیام موفقیت می‌گرفت)
      if (!currentActiveUser) {
        // فرم ورود روی همین سبد باز می‌شود (سبد بسته نمی‌شود) و بعد از ورود به همین سبد برمی‌گردیم
        pendingCheckoutAfterAuth = true;
        openAuthModal('login');
        return;
      }

      // اصلاح باگ: کتاب‌های قبلاً خریداری‌شده اینجا هم (نه فقط موقع باز کردن مودال) دوباره از سبد حذف می‌شوند
      // تا نه در فاکتور و نه در محاسبه تخفیف دخالتی نداشته باشند
      sanitizeCartForActiveUser();
      const currentCartBooks = cartBookIds.map(id => books.find(b => b.id === id)).filter(Boolean);

      if (currentCartBooks.length === 0) {
        alert(currentLang === 'fa' ? '📚 همه‌ی کتاب‌های سبد قبلاً در قفسه شما هستند.' : '📚 All books in your cart are already in your shelf.');
        closeCartModal();
        return;
      }

      // وضعیت «تخفیفات ویژه» یک‌بار و قبل از ثبت خرید ثابت می‌شود (خودِ خرید فعالیت کاربر را بالا می‌برد و نباید وسط کار لیست را عوض کند)
      const dbUserForDeals = getUsersDatabase().find(u => u.phone === currentActiveUser.phone) || currentActiveUser;
      const dealsNow = getSpecialDealsForUser(dbUserForDeals, true).map;

      // اگر کتابی که کد تخفیف مخصوص همان بود دیگر در سبد نیست (مثلاً حذف شده بود)، کد نادیده گرفته می‌شود
      const voucherBookStillInCart = appliedVoucherCode && appliedVoucherBookId &&
        currentCartBooks.some(b => b.id === appliedVoucherBookId && !dealsNow[b.id]);
      if (appliedVoucherCode && !voucherBookStillInCart) {
        appliedVoucherCode = null;
        appliedVoucherBookId = null;
        appliedDiscountPercentage = 0;
      }

      if (currentActiveUser) {
        const users = getUsersDatabase();
        const uIdx = users.findIndex(u => u.phone === currentActiveUser.phone);
        if (uIdx !== -1) {
          if (!users[uIdx].purchasedBooks) users[uIdx].purchasedBooks = [];

          // ۱. ابتدا کتاب‌های واقعاً جدید به قفسه کاربر اضافه می‌شوند (همه با قیمت کامل ثبت می‌شوند؛
          // فقط پورسانتِ کتابِ دارای کد بر مبنای قیمت تخفیف‌خورده محاسبه خواهد شد)
          const newlyPurchased = [];
          currentCartBooks.forEach(b => {
            if (!users[uIdx].purchasedBooks.some(item => item.id === b.id)) {
              users[uIdx].purchasedBooks.push({
                id: b.id,
                title: b.title[currentLang],
                author: b.author[currentLang],
                status: 'unread',
                ts: Date.now(), // برای شمارش امتیاز ماهانه‌ی چالش «آواتار اختصاصی»
                ...(dealsNow[b.id] ? { dealPct: dealsNow[b.id] } : {})   // خرید از «تخفیفات ویژه»: بدون پورسانت
              });
              newlyPurchased.push(b);
            }
          });

          // ۲. کد تخفیف فقط "پس از" اطمینان از ثبت موفق همان کتاب مشخص سوزانده می‌شود؛ تخفیف فقط
          // روی همین یک کتاب اعمال می‌شود، بقیه کتاب‌های سبد با قیمت کامل حساب می‌شوند
          let discountedBookId = null;
          let paidDiscountPct = 0;
          if (appliedVoucherCode && newlyPurchased.some(b => b.id === appliedVoucherBookId) && !dealsNow[appliedVoucherBookId] && users[uIdx].userVouchers) {
            const vIndex = findVoucherIndex(users[uIdx].userVouchers, appliedVoucherCode);
            if (vIndex !== -1) {
              paidDiscountPct = users[uIdx].userVouchers[vIndex].percent || 0; // درصد از خودِ کد ذخیره‌شده خوانده می‌شود، نه از متغیر صفحه
              discountedBookId = appliedVoucherBookId;
              users[uIdx].userVouchers.splice(vIndex, 1);
            }
          }

          // ===== پورسانت افیلیت (فقط ۲ لایه بالاسری) روی کتاب‌هایی که همین الان به حساب خریدار اضافه شدند =====
          const buyer = users[uIdx];
          if (buyer.referredBy && newlyPurchased.length > 0) {
            const findByRefCode = code => code
              ? users.find(u => u.referralCode && u.referralCode.toUpperCase() === String(code).toUpperCase())
              : null;
            const tier1 = findByRefCode(buyer.referredBy);
            const tier1Ok = !!tier1 && tier1.phone !== buyer.phone;
            const tier2 = tier1Ok ? findByRefCode(tier1.referredBy) : null;
            const tier2Ok = !!tier2 && tier2.phone !== buyer.phone && tier2.phone !== tier1.phone;
            const nowTs = Date.now();

            // متن تراکنش به هر دو زبان ذخیره می‌شود تا معرف با هر زبانی وارد شد (یا زبان را عوض کرد) درست ببیند
            const creditCommission = (target, amount, tier, book, descFa, descEn) => {
              if (!(amount > 0)) return;
              target.wallet = (target.wallet || 0) + amount;
              if (!Array.isArray(target.transactions)) target.transactions = [];
              target.transactions.push({
                date: new Date(nowTs).toLocaleDateString(currentLang === 'fa' ? 'fa-IR' : 'en-US'),
                timestamp: nowTs,
                type: 'deposit',
                amount: amount,
                desc: currentLang === 'fa' ? descFa : descEn,
                descFa: descFa,
                descEn: descEn,
                status: currentLang === 'fa' ? 'موفق' : 'Successful',
                statusFa: 'موفق',
                statusEn: 'Successful',
                tier: tier,
                bookId: book.id
              });
            };

            newlyPurchased.forEach(b => {
              // کتاب‌های «تخفیفات ویژه» هیچ پورسانتی (نه لایه ۱ و نه لایه ۲) ندارند
              if (dealsNow[b.id]) return;
              // اصلاح: درصد تخفیف فقط برای کتابی که کد رویش اعمال شده حساب می‌شود؛ بقیه کتاب‌ها قیمت کامل
              const pctForThisBook = (b.id === discountedBookId) ? paidDiscountPct : 0;
              const paidPrice = Math.round((b.totalPrice || 0) * (1 - pctForThisBook / 100));
              if (!(paidPrice > 0)) return;
              const titleFa = (b.title && b.title.fa) || '';
              const titleEn = (b.title && b.title.en) || '';

              if (tier1Ok) {
                // واجد شرایط بونوس: معرف خودش قبلاً همین کتاب را خریده باشد (لازم نیست خوانده باشد)
                const eligibleForBonus = (tier1.purchasedBooks || []).some(pb => pb.id === b.id);
                // یکی‌درمیان: فقط دفعاتِ زوجِ واجد شرایط (دومین، چهارمین و ...) به بونوس ۳۰٪ می‌رسند
                let sharedBonus = false;
                if (eligibleForBonus) {
                  tier1.sharedBonusEligibleCount = (tier1.sharedBonusEligibleCount || 0) + 1;
                  sharedBonus = (tier1.sharedBonusEligibleCount % 2 === 0);
                }
                creditCommission(tier1, Math.round(paidPrice * (sharedBonus ? 0.30 : 0.25)), 1, b,
                  `پورسانت لایه ۱ (${sharedBonus ? '۳۰٪ بونوس کتاب مشترک' : '۲۵٪'}) - خرید کتاب «${titleFa}»`,
                  `Tier 1 Commission (${sharedBonus ? '30% shared-book bonus' : '25%'}) - purchase of "${titleEn}"`);
              }
              if (tier2Ok) {
                creditCommission(tier2, Math.round(paidPrice * 0.10), 2, b,
                  `پورسانت لایه ۲ (۱۰٪) - خرید کتاب «${titleFa}»`,
                  `Tier 2 Commission (10%) - purchase of "${titleEn}"`);
              }
            });
            }

            if (!saveUsersDatabase(users)) return;   // ذخیره نشد: خرید نهایی نشود و سبد خرید دست‌نخورده بماند
            currentActiveUser = users[uIdx];
            localStorage.setItem('pdf_market_active_session', JSON.stringify(currentActiveUser));
        }
      }

      alert(currentLang === 'fa' ? '🎉 خرید شما با موفقیت نهایی شد و کتاب‌ها به قفسه شخصی‌تان اضافه شدند!' : '🎉 Purchase finalized successfully! Books added to your shelf.');
      cartBookIds = [];
      localStorage.setItem('pdf_market_cart_ids', JSON.stringify(cartBookIds));
      appliedDiscountPercentage = 0;
      appliedVoucherCode = null;
      appliedVoucherBookId = null;
      updateCartBadge();
      invalidateSpecialDealsCache();
      refreshDealViews();
      if (currentActiveUser) {
        renderUserShelf();
        if (typeof renderUserVouchers === 'function') renderUserVouchers();
      }
      closeCartModal();
    }

    // انتخاب آواتارها و نمایش شرط‌های قفل‌شده
    function openAvatarSelectModal() {
      if (!currentActiveUser) return;
      closeUserPanelModal();
      document.getElementById('avatarSelectModal').style.display = 'flex';
      renderAvatarGrid();
    }

    // راهنمای آواتارها: پنجره‌ی انتخاب آواتار موقتاً پنهان می‌شود و با بستن راهنما دوباره برمی‌گردد
    function openAvatarHelpModal() {
      document.getElementById('avatarSelectModal').style.display = 'none';
      document.getElementById('avatarHelpModal').style.display = 'flex';
    }

    function closeAvatarHelpModal() {
      document.getElementById('avatarHelpModal').style.display = 'none';
      document.getElementById('avatarSelectModal').style.display = 'flex';
    }

    function closeAvatarSelectModal() {
      document.getElementById('avatarSelectModal').style.display = 'none';
      openUserPanelModal();
    }

    // ===== ابزارهای ماه شمسی برای چالش ماهانه‌ی آواتار اختصاصی =====
    // چون کاربران عمدتاً فارسی‌زبان هستند، مبنای شروع/پایان دوره‌ی ماهانه همیشه ماه شمسی (جلالی) است؛
    // این کلید فقط برای گروه‌بندی داخلی استفاده می‌شود و مستقل از زبان نمایش سایت (fa/en) است.
    // ===== کد تخفیف: ساخت امن =====
    // ۱۲ کاراکتر کاملاً تصادفی (حدود ۶۰ بیت) با تولیدکننده‌ی تصادفیِ امنِ مرورگر؛ نام کاربری داخل کد نیست تا قابل حدس نباشد.
    // حروف و اعداد شبیه هم (0/O و 1/I) حذف شده‌اند. چون ۲۵۶ بر ۳۲ بخش‌پذیر است، انتخاب کاراکتر بدون سوگیری است.
    function generateVoucherCode(prefix) {
      const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      const buf = new Uint8Array(12);
      if (typeof crypto !== 'undefined' && crypto.getRandomValues) crypto.getRandomValues(buf);
      else for (let i = 0; i < buf.length; i++) buf[i] = Math.floor(Math.random() * 256); // فقط برای مرورگرهای خیلی قدیمی
      let out = '';
      for (let i = 0; i < buf.length; i++) out += alphabet[buf[i] % 32];
      return prefix + '-' + out.slice(0, 4) + '-' + out.slice(4, 8) + '-' + out.slice(8, 12);
    }

    // ===== کد تخفیف: پیدا کردن و مصرف (همه‌ی بررسی‌ها از همین دو تابع می‌گذرند) =====
    // وقتی سرور داشتی، فقط همین دو تابع باید به API سرور وصل شوند.
    function findVoucherIndex(list, code) {
      const c = String(code || '').trim().toUpperCase();
      if (!c || !Array.isArray(list)) return -1;
      return list.findIndex(v => v && String(v.code).toUpperCase() === c);
    }
    function findVoucherInList(list, code) {
      const i = findVoucherIndex(list, code);
      return i === -1 ? null : list[i];
    }

    // ===== تاریخ شمسی خالص =====
    // همه‌ی ماه و روزِ مسابقه بر اساس تقویم شمسی و ساعت تهران (UTC+3:30) حساب می‌شود؛
    // نه به منطقه‌ی زمانی دستگاه کاربر وابسته است و نه به Intl مرورگر، و هیچ حالت «میلادی جایگزین» ندارد.
    function gregorianToJalali(gy, gm, gd) {
      const gdm = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
      let jy = gy <= 1600 ? 0 : 979;
      gy -= gy <= 1600 ? 621 : 1600;
      const gy2 = gm > 2 ? gy + 1 : gy;
      let days = 365 * gy + Math.floor((gy2 + 3) / 4) - Math.floor((gy2 + 99) / 100) + Math.floor((gy2 + 399) / 400) - 80 + gd + gdm[gm - 1];
      jy += 33 * Math.floor(days / 12053); days %= 12053;
      jy += 4 * Math.floor(days / 1461); days %= 1461;
      if (days > 365) { jy += Math.floor((days - 1) / 365); days = (days - 1) % 365; }
      const jm = days < 186 ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);
      const jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30);
      return { jy: jy, jm: jm, jd: jd };
    }
    // تاریخ میلادیِ همان لحظه به وقت تهران
    function getTehranYmd(date) {
      const t = new Date(date.getTime() + 12600000);
      return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() };
    }
    function getJalaliMonthKey(dateInput) {
      const d = (dateInput instanceof Date) ? dateInput : new Date(dateInput);
      if (isNaN(d.getTime())) return '';
      const g = getTehranYmd(d);
      const j = gregorianToJalali(g.y, g.m, g.d);
      return j.jy + '-' + String(j.jm).padStart(2, '0');
    }
    // ===== زمان‌بندی مسابقه =====
    // مسابقه‌ی هر ماه تا نیمه‌شبِ روزِ یکی‌مانده به آخر ماه ادامه دارد؛ از ساعت ۰۰:۰۰ آخرین روز ماه، برندگان اعلام می‌شوند
    // و آخرین روز ماه «روز اعلام و تأیید مدیر» است (فعالیت آن روز در مسابقه‌ی ماه حساب نمی‌شود).
    function addMonthsToKey(key, n) {
      const p = String(key).split('-');
      const t = parseInt(p[0], 10) * 12 + (parseInt(p[1], 10) - 1) + n;
      return Math.floor(t / 12) + '-' + String(t % 12 + 1).padStart(2, '0');
    }
    const _lastDayMemo = {};
    function isLastDayOfMonth(date) {
      const g = getTehranYmd(date);
      const k = g.y + '-' + g.m + '-' + g.d;
      if (k in _lastDayMemo) return _lastDayMemo[k];
      const r = getJalaliMonthKey(new Date(date.getTime() + 86400000)) !== getJalaliMonthKey(date);
      _lastDayMemo[k] = r;
      return r;
    }
    function isLastDayOfDayKey(dk) {
      const p = String(dk).split('-').map(Number);
      const n = new Date(Date.UTC(p[0], p[1] - 1, p[2] + 1));
      return gregorianToJalali(p[0], p[1], p[2]).jm !== gregorianToJalali(n.getUTCFullYear(), n.getUTCMonth() + 1, n.getUTCDate()).jm;
    }
    // کلید «دوره‌ی مسابقه»: در آخرین روز ماه، دوره‌ی ماه بعد شروع شده است
    function getContestPeriodKey(now) {
      now = now || new Date();
      const cur = getJalaliMonthKey(now);
      return isLastDayOfMonth(now) ? addMonthsToKey(cur, 1) : cur;
    }
    function getCurrentMonthKey() { return getContestPeriodKey(new Date()); }
    // چند روز تا پایان مسابقه مانده (با احتساب امروز): ۱ = امروز آخرین روز مسابقه است
    function getContestDaysLeft(now) {
      now = now || new Date();
      const period = getContestPeriodKey(now);
      for (let i = 0; i < 45; i++) {
        const x = new Date(now.getTime() + i * 86400000);
        if (getJalaliMonthKey(x) === period && isLastDayOfMonth(x)) return Math.max(i, 1);
      }
      return 1;
    }
    function getJalaliMonthKeyFromDayKey(dayKey) {
      // dayKey میلادی و به فرم YYYY-MM-DD است (خروجی getLocalDayKey، روز به وقت تهران)
      const p = String(dayKey).split('-').map(Number);
      const j = gregorianToJalali(p[0], p[1], p[2]);
      return j.jy + '-' + String(j.jm).padStart(2, '0');
    }

    // امتیاز ماهانه‌ی یک کاربر: فقط رویدادهایی که تاریخ‌دار هستند و در همین ماه شمسی رخ داده‌اند حساب می‌شوند
    // (خریدها/زیرمجموعه‌های قدیمی‌تر از اجرای این قابلیت تاریخ ندارند، پس خودبه‌خود از این ماه به بعد شمارش می‌شوند)
    function getUserMonthlyStats(user, monthKey) {
      const booksThisMonth = (user.purchasedBooks || []).filter(pb => pb.ts && getJalaliMonthKey(new Date(pb.ts)) === monthKey).length;
      const refsThisMonth = (user.referralLog || []).filter(r => r.ts && getJalaliMonthKey(new Date(r.ts)) === monthKey).length;
      const minsThisMonth = (user.readingLogs || []).filter(l => l.dayKey && getJalaliMonthKeyFromDayKey(l.dayKey) === monthKey).reduce((acc, l) => acc + (l.minutes || 0), 0);
      // همان اولویت‌بندی قبلی: خرید کتاب اولویت اول، زیرمجموعه اولویت دوم، مطالعه اولویت سوم
      const score = (booksThisMonth * 100000) + (refsThisMonth * 1000) + minsThisMonth;
      return { booksThisMonth, refsThisMonth, minsThisMonth, score };
    }

    // ===== چرخه‌ی ماهانه‌ی «آواتار اختصاصی» =====
    // قانون: رقابتِ هر ماه شمسی، برنده‌ی «ماه بعد» را تعیین می‌کند. برنده در پایان ماه (لحظه‌ی شروع ماه جدید) قطعی و اعلام می‌شود
    // و فقط در همان ماه جدید (یک بازه‌ی ۲۹ تا ۳۱ روزه) حق گذاشتن عکس اختصاصی دارد؛ همزمان رقابت برای برنده‌ی ماه بعدی شروع می‌شود.
    // اولویت امتیاز (بدون تساوی): خرید کتاب > زیرمجموعه > دقایق مطالعه > دقایق حضور در سایت > ثانیه‌ها > تاریخ ثبت‌نام
    const CHAMPIONS_KEY = 'pdf_market_champions';   // { [monthKey]: { phone, username, stats, tied, excludedPhone, ... } }  ← برنده‌ی همان ماه
    const PRESENCE_KEY = 'pdf_market_presence';     // { [phone]: { [dayKey]: seconds } }  ← زمان حضور فعال در سایت
    const PRESENCE_TICK_MS = 15000;
    const PRESENCE_IDLE_LIMIT_MS = 120000;          // اگر بیش از ۲ دقیقه هیچ تعاملی نباشد (و خواننده باز نباشد)، حضور شمرده نمی‌شود
    const MONTH_NAMES_FA = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];
    const MONTH_NAMES_EN = ['Farvardin', 'Ordibehesht', 'Khordad', 'Tir', 'Mordad', 'Shahrivar', 'Mehr', 'Aban', 'Azar', 'Dey', 'Bahman', 'Esfand'];
    const CHAMP_LEVELS = [
      { fa: 'خرید کتاب', en: 'Books bought' },
      { fa: 'دعوت زیرمجموعه', en: 'Referrals' },
      { fa: 'دقایق مطالعه', en: 'Reading minutes' },
      { fa: 'دقایق حضور در سایت', en: 'Minutes on site' }
    ];

    function fmtL(lang, n) { return Number(n || 0).toLocaleString(lang === 'fa' ? 'fa-IR' : 'en-US'); }
    function monthNameOf(monthKey, lang) {
      const m = parseInt(String(monthKey).split('-')[1], 10);
      const arr = lang === 'fa' ? MONTH_NAMES_FA : MONTH_NAMES_EN;
      return arr[m - 1] || String(monthKey);
    }
    function addDaysToDate(date, n) { return new Date(date.getTime() + n * 86400000); }
    // چند روز تا پایان ماه شمسی مانده (با احتساب امروز): ۱ = امروز آخرین روز ماه است، ۲ = یک روز مانده به آخرین روز
    function getMonthDaysLeft(now) {
      const key = getJalaliMonthKey(now);
      let left = 1;
      while (left <= 32 && getJalaliMonthKey(addDaysToDate(now, left)) === key) left++;
      return left;
    }
    // کلید ماه قبل (dir = -1) یا ماه بعد (dir = +1)
    function getAdjacentMonthKey(dir) { return addMonthsToKey(getCurrentMonthKey(), dir); }

    // ----- ثبت زمان حضور فعال در سایت (فقط کاربر واردشده، تب دیده‌شده، و تعامل اخیر) -----
    function readPresence() {
      try {
        const raw = JSON.parse(localStorage.getItem(PRESENCE_KEY) || '{}');
        return (raw && typeof raw === 'object' && !Array.isArray(raw)) ? raw : {};
      } catch (e) { return {}; }
    }
    function addPresenceSeconds(phone, seconds) {
      if (!phone || !(seconds > 0)) return;
      const all = readPresence();
      const dk = getLocalDayKey(new Date());
      if (!all[phone]) all[phone] = {};
      all[phone][dk] = (Number(all[phone][dk]) || 0) + seconds;
      // فقط حدود ۷۰ روز اخیر لازم است (ماه جاری و ماه قبل)؛ قدیمی‌تر پاک می‌شود تا حافظه‌ی مرورگر پر نشود
      const cutoff = getLocalDayKey(addDaysToDate(new Date(), -70));
      Object.keys(all).forEach(p => {
        Object.keys(all[p]).forEach(k => { if (k < cutoff) delete all[p][k]; });
        if (Object.keys(all[p]).length === 0) delete all[p];
      });
      try { localStorage.setItem(PRESENCE_KEY, JSON.stringify(all)); } catch (e) { /* حافظه‌ی مرورگر پر یا غیرفعال است */ }
    }
    let lastUserActivityTs = Date.now();
    ['pointerdown', 'pointermove', 'keydown', 'scroll', 'touchstart', 'wheel', 'click'].forEach(ev => {
      window.addEventListener(ev, () => { lastUserActivityTs = Date.now(); }, { passive: true });
    });
    function presenceTick() {
      if (!currentActiveUser) return;
      if (document.visibilityState !== 'visible') return;
      const readerOpen = activeReadingInterval !== null;   // وقتی خواننده باز است، حضور حساب می‌شود حتی اگر کاربر دست نزند
      if (!readerOpen && (Date.now() - lastUserActivityTs) > PRESENCE_IDLE_LIMIT_MS) return;
      addPresenceSeconds(currentActiveUser.phone, PRESENCE_TICK_MS / 1000);
    }
    setInterval(presenceTick, PRESENCE_TICK_MS);

    // ----- شرط ورود به رقابت: باز بودن حداقل ۹ آواتار (بدون فراخوانی getVipItemState تا حلقه‌ی بی‌پایان ایجاد نشود) -----
    function getVipUnlockedCount(user) {
      const { chain } = getUnlockedAvatarList(user);
      return chain.filter(c => c.unlocked).length;
    }
    function isVipEligible(user) { return getVipUnlockedCount(user) >= 9; }

    // آمار دقیق یک کاربر در یک ماه شمسی؛ ctx (اختیاری) برای جلوگیری از خواندن مکرر localStorage است
    function getUserMonthlyDetail(user, monthKey, ctx) {
      const pendAll = (ctx && ctx.pend) || readReadingPending();
      const presAll = (ctx && ctx.pres) || readPresence();
      const books = (user.purchasedBooks || []).filter(pb => pb.ts && getJalaliMonthKey(new Date(pb.ts)) === monthKey && !isLastDayOfMonth(new Date(pb.ts))).length;
      const refs = (user.referralLog || []).filter(r => r.ts && getJalaliMonthKey(new Date(r.ts)) === monthKey && !isLastDayOfMonth(new Date(r.ts))).length;
      const loggedMinutes = (user.readingLogs || [])
        .filter(l => l.dayKey && getJalaliMonthKeyFromDayKey(l.dayKey) === monthKey && !isLastDayOfDayKey(l.dayKey))
        .reduce((acc, l) => acc + (l.minutes || 0), 0);
      let pendingReadSec = 0;
      const pend = pendAll[user.phone];
      if (pend) Object.keys(pend).forEach(dk => { if (getJalaliMonthKeyFromDayKey(dk) === monthKey && !isLastDayOfDayKey(dk)) pendingReadSec += Number(pend[dk]) || 0; });
      let presSec = 0;
      const pres = presAll[user.phone];
      if (pres) Object.keys(pres).forEach(dk => { if (getJalaliMonthKeyFromDayKey(dk) === monthKey && !isLastDayOfDayKey(dk)) presSec += Number(pres[dk]) || 0; });
      const readSeconds = loggedMinutes * 60 + Math.floor(pendingReadSec);
      return {
        books, refs,
        readMinutes: Math.floor(readSeconds / 60),
        presenceMinutes: Math.floor(presSec / 60),
        readSeconds,
        presenceSeconds: Math.floor(presSec)
      };
    }
    function levelVals(d) { return [d.books, d.refs, d.readMinutes, d.presenceMinutes]; }

    // ===================================================================================
    // ===== تخفیفات ویژه‌ی ماهانه (کاملاً سمت مرورگر؛ بدون نیاز به سرور) =====
    // • هر ماه شمسی، تعدادی کتاب (حداکثر ۵۰، و تا وقتی کاتالوگ کوچک است حداکثر نیمی از کتاب‌ها) با seed ثابتِ همان ماه تصادفی انتخاب می‌شوند.
    // • هر کتاب یک درصد تخفیف ۲۰ تا ۳۰ می‌گیرد.
    // • لیست برای مهمان/کاربر کم‌فعالیت «لیست پایه» است؛ هرچه فعالیت کاربر (خرید، زیرمجموعه، مطالعه، حضور) بیشتر باشد
    //   کمی از کتاب‌های لیست با کتاب‌های پرفروش‌تر عوض می‌شود و درصد تخفیف هم بالاتر می‌رود (سه سطح).
    // • روی این کتاب‌ها کد تخفیف اعمال نمی‌شود و خریدشان پورسانت ندارد.
    // • کل این بلوک باید در app-index.js و app-author.js یکسان بماند (check-sync.sh بررسی می‌کند).
    // ===================================================================================
    const SPECIAL_DEALS_COUNT = 50;
    const SPECIAL_DEALS_MAX_SHARE = 0.5;
    const SPECIAL_DEAL_MIN_PCT = 20;
    const SPECIAL_DEAL_MAX_PCT = 30;
    const SPECIAL_DEALS_SALT = 'pdfmarket-deals-v1';
    const SPECIAL_DEALS_LEVEL_SWAP = [0, 0.15, 0.30];   // سهم کتاب‌هایی که برای هر سطح با کتاب‌های بهتر عوض می‌شوند
    const SPECIAL_DEALS_LEVEL_POINTS = [0, 8, 25];      // حداقل امتیاز فعالیت برای سطح ۱ و ۲ (سطح ۰ = لیست پایه)
    const SPECIAL_DEALS_CACHE_MS = 15000;
    let specialDealsCache = {};

    function dealRng(seedStr) {
      let h = 1779033703 ^ seedStr.length;
      for (let i = 0; i < seedStr.length; i++) { h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
      h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909);
      let a = (h ^= h >>> 16) >>> 0;
      return function () {
        a |= 0; a = (a + 0x6D2B79F5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    }
    function getSpecialDealsCount() {
      return Math.max(1, Math.min(SPECIAL_DEALS_COUNT, Math.floor(books.length * SPECIAL_DEALS_MAX_SHARE)));
    }
    // کیفیت کتاب = میانگین رتبه‌ی فروش در سایت، ایران و جهان (۰ تا ۳)
    function dealQualityMap() {
      const q = {};
      books.forEach(b => { q[b.id] = 0; });
      ['salesSite', 'salesIran', 'salesWorld'].forEach(f => {
        const sorted = [...books].sort((a, b) => ((a[f] || 0) - (b[f] || 0)) || (String(a.id) < String(b.id) ? -1 : 1));
        sorted.forEach((b, i) => { q[b.id] += books.length > 1 ? i / (books.length - 1) : 0; });
      });
      return q;
    }
    function buildSpecialDealIds(monthKey, level) {
      const n = getSpecialDealsCount();
      const rng = dealRng(SPECIAL_DEALS_SALT + '|list|' + monthKey);
      const order = books.map(b => String(b.id)).sort();
      for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); const tmp = order[i]; order[i] = order[j]; order[j] = tmp; }
      const chosen = order.slice(0, n);
      if (!level) return chosen;
      const q = dealQualityMap();
      const swaps = Math.max(1, Math.round(n * SPECIAL_DEALS_LEVEL_SWAP[level]));
      const outside = order.slice(n).sort((a, b) => (q[b] - q[a]) || (a < b ? -1 : 1));
      const inside = chosen.slice().sort((a, b) => (q[a] - q[b]) || (a < b ? -1 : 1));
      const result = new Set(chosen);
      for (let k = 0; k < swaps && k < outside.length && k < inside.length; k++) {
        if (q[outside[k]] <= q[inside[k]]) break;
        result.delete(inside[k]); result.add(outside[k]);
      }
      return Array.from(result);
    }
    function dealPercentFor(monthKey, bookId, level) {
      const r = dealRng(SPECIAL_DEALS_SALT + '|pct|' + monthKey + '|' + bookId)();
      return Math.min(SPECIAL_DEAL_MAX_PCT, SPECIAL_DEAL_MIN_PCT + level * 2 + Math.round(r * 6));   // سطح ۰: ۲۰–۲۶ | ۱: ۲۲–۲۸ | ۲: ۲۴–۳۰
    }
    // امتیاز فعالیت: خرید کتاب > زیرمجموعه > مطالعه > حضور در سایت (ماه جاری + نصفِ ماه قبل)
    function getUserActivityPoints(user) {
      const ctx = { pend: readReadingPending(), pres: readPresence() };
      const mk = getJalaliMonthKey(new Date());
      const pts = key => { const d = getUserMonthlyDetail(user, key, ctx); return d.books * 10 + d.refs * 6 + d.readMinutes / 30 + d.presenceMinutes / 60; };
      return pts(mk) + 0.5 * pts(addMonthsToKey(mk, -1));
    }
    function getSpecialDealsForUser(user, fresh) {
      const mk = getJalaliMonthKey(new Date());
      const ck = (user && user.phone ? user.phone : 'guest') + '|' + mk;
      const hit = specialDealsCache[ck];
      if (!fresh && hit && (Date.now() - hit.at) < SPECIAL_DEALS_CACHE_MS) return hit.val;
      let points = 0, level = 0;
      if (user && user.phone) {
        try { points = getUserActivityPoints(user); } catch (e) { points = 0; }
        level = points >= SPECIAL_DEALS_LEVEL_POINTS[2] ? 2 : (points >= SPECIAL_DEALS_LEVEL_POINTS[1] ? 1 : 0);
      }
      const map = {};
      buildSpecialDealIds(mk, level).forEach(id => { map[id] = dealPercentFor(mk, id, level); });
      const val = { monthKey: mk, level: level, points: points, map: map };
      specialDealsCache[ck] = { at: Date.now(), val: val };
      return val;
    }
    function invalidateSpecialDealsCache() { specialDealsCache = {}; }
    // اگر این کتاب الان برای کاربر فعلی «تخفیف ویژه» است: { pct, price, original } وگرنه null
    function getBookDeal(bookId) {
      const b = books.find(x => x.id === bookId);
      if (!b) return null;
      const pct = getSpecialDealsForUser(currentActiveUser).map[bookId];
      if (!pct) return null;
      return { pct: pct, original: b.totalPrice, price: Math.round(b.totalPrice * (1 - pct / 100)) };
    }
    function bookPayPrice(b) { const d = getBookDeal(b.id); return d ? d.price : b.totalPrice; }
    function dealPriceHtml(b, t) {
      const d = getBookDeal(b.id);
      if (!d) return b.totalPrice.toLocaleString() + ' ' + t.currency;
      return '<s class="deal-old">' + b.totalPrice.toLocaleString() + '</s> ' + d.price.toLocaleString() + ' ' + t.currency + ' <span class="deal-badge">' + d.pct + '%-</span>';
    }
    // بعد از خرید/ورود: لیست و قیمت‌ها دوباره ساخته می‌شوند (فقط جایی که لیست اصلی روی صفحه است)
    function refreshDealViews() {
      try { if (typeof handleSmartSearch === 'function' && document.getElementById('booksCatalog')) handleSmartSearch(); } catch (e) { /* مهم نیست */ }
    }

    // فقط کاربران واجد شرایط (۹ آواتار) که در همان ماه حداقل یک فعالیت داشته‌اند وارد رقابت می‌شوند
    function getEligibleContenders(monthKey) {
      const ctx = { pend: readReadingPending(), pres: readPresence() };
      return getUsersDatabase()
        .filter(u => isVipEligible(u))
        .map(u => ({ phone: u.phone, username: u.username, reg: u.regTimestamp || 0, d: getUserMonthlyDetail(u, monthKey, ctx) }))
        .filter(c => (c.d.books + c.d.refs + c.d.readSeconds + c.d.presenceSeconds) > 0);
    }
    function champTieKey(c) { return levelVals(c.d).join('|'); }
    // مقایسه‌ی کاملاً قطعی: چهار سطح دقیقه‌ای، بعد ثانیه‌ی مطالعه، بعد ثانیه‌ی حضور، بعد ثبت‌نام قدیمی‌تر، بعد شماره (تا هیچ‌وقت تساوی نماند)
    function champCompare(a, b) {
      const x = levelVals(a.d), y = levelVals(b.d);
      for (let i = 0; i < 4; i++) if (x[i] !== y[i]) return y[i] - x[i];
      return (b.d.readSeconds - a.d.readSeconds)
        || (b.d.presenceSeconds - a.d.presenceSeconds)
        || (a.reg - b.reg)
        || String(a.phone).localeCompare(String(b.phone));
    }
    // نتیجه‌ی رقابت یک ماه. اگر چند نفر در چهار سطح اصلی دقیقاً مساوی اول شده باشند و برنده‌ی ماه قبل بینشان باشد،
    // او کنار گذاشته می‌شود و بین بقیه، با دقت ثانیه، بالاترین امتیاز برنده است.
    function computeCompetition(monthKey, previousChampionPhone) {
      const ranking = getEligibleContenders(monthKey).sort(champCompare);
      if (ranking.length === 0) return { ranking, winner: null, excluded: null, tied: false, tiedCount: 0 };
      const topKey = champTieKey(ranking[0]);
      const group = ranking.filter(c => champTieKey(c) === topKey);
      let winner = ranking[0];
      let excluded = null;
      if (group.length > 1 && previousChampionPhone) {
        const prev = group.find(c => c.phone === previousChampionPhone);
        if (prev) {
          excluded = prev;
          winner = group.find(c => c.phone !== previousChampionPhone);
        }
      }
      return { ranking, winner, excluded, tied: group.length > 1, tiedCount: group.length };
    }

    // ----- ذخیره‌ی برندگان هر ماه -----
    function readChampions() {
      try {
        const raw = JSON.parse(localStorage.getItem(CHAMPIONS_KEY) || '{}');
        return (raw && typeof raw === 'object' && !Array.isArray(raw)) ? raw : {};
      } catch (e) { return {}; }
    }
    function writeChampions(obj) {
      try { localStorage.setItem(CHAMPIONS_KEY, JSON.stringify(obj)); return true; } catch (e) { return false; /* حافظه‌ی مرورگر پر یا غیرفعال است */ }
    }

    // اگر برنده‌ی ماه جاری هنوز قطعی نشده باشد، از روی رقابت ماه قبل مشخص و اعلام می‌شود (فقط یک بار برای هر ماه)
    function finalizeMonthlyChampion() {
      const curKey = getCurrentMonthKey();
      const champs = readChampions();

      // کش فقط وقتی معتبر است که واقعاً یک برنده (با شماره تلفن) ثبت شده باشد
      if (champs[curKey] && champs[curKey].phone) return champs[curKey];

      const prevKey = getAdjacentMonthKey(-1);
      const prevRec = champs[prevKey] || null;
      const prevChampPhone = prevRec ? prevRec.phone : null;
      const res = computeCompetition(prevKey, prevChampPhone);

      // اگر ماه قبل برنده‌ای نداشت (مثلاً ماه اول سایت)، رکوردی ذخیره نمی‌شود تا در مراجعه‌ی بعدی دوباره محاسبه شود
      if (!res.winner) {
        return {
          phone: null, username: null, stats: null, basedOnMonth: prevKey,
          tied: false, tiedCount: 0, excludedPhone: null, excludedUsername: null, decidedAt: null,
          podium: [], record: null, giftWithheld: false
        };
      }

      const podium = buildPodium(res);
      // تا وقتی چارت زیرمجموعه‌ی هدیه‌ی برندگان قبلی کامل نشده، جایزه‌ی زیرمجموعه‌ی این ماه موقتاً داده نمی‌شود
      const giftWithheld = readGiftPool().some(e => e.filled < e.quota);
      const rec = {
        phone: res.winner.phone,
        username: res.winner.username,
        stats: res.winner.d,
        basedOnMonth: prevKey,
        tied: res.tied,
        tiedCount: res.tiedCount,
        excludedPhone: res.excluded ? res.excluded.phone : null,
        excludedUsername: res.excluded ? res.excluded.username : null,
        decidedAt: Date.now(),
        podium: podium,
        record: computeRecordFlags(res.winner.d, prevRec && prevRec.stats),
        giftWithheld: giftWithheld
      };
      champs[curKey] = rec;
      // اول ثبت برنده؛ اگر ذخیره نشد (حافظه‌ی مرورگر پر یا بسته است) هیچ جایزه‌ای داده نمی‌شود تا دفعه‌ی بعد دوباره جایزه ندهیم
      if (!writeChampions(champs)) return rec;
      if (!applyContestPrizes(rec, prevKey, curKey)) {
        // ذخیره‌ی جوایز شکست خورد: ثبت برنده را برمی‌گردانیم تا بعداً دوباره و درست انجام شود
        delete champs[curKey];
        writeChampions(champs);
        return rec;
      }
      if (rec.excludedPhone) sendInboxMessage(rec.excludedPhone, buildExcludedMessage(rec, prevKey, curKey));
      return rec;
    }

    // ===== جوایز مسابقه‌ی ماهانه =====
    const CONTEST_PRIZES = [
      { rank: 1, gift: 10, pct: 15 },
      { rank: 2, gift: 7, pct: 15 },
      { rank: 3, gift: 4, pct: 10 }
    ];
    const GIFT_POOL_KEY = 'pdf_market_gift_pool';   // [{ id, phone, username, rank, periodKey, quota, filled, createdAt }]
    function readGiftPool() {
      try {
        const r = JSON.parse(localStorage.getItem(GIFT_POOL_KEY) || '[]');
        return Array.isArray(r) ? r.filter(e => e && typeof e === 'object') : [];
      } catch (e) { return []; }
    }
    function writeGiftPool(p) {
      try { localStorage.setItem(GIFT_POOL_KEY, JSON.stringify(p)); return true; } catch (e) { return false; }
    }
    // سه نفر اول: برنده‌ی نهایی (با قانون تساوی) و بعد دو نفر بعدیِ جدول
    function buildPodium(res) {
      const list = [];
      if (!res.winner) return list;
      list.push(res.winner);
      res.ranking.forEach(c => { if (list.length < 3 && c.phone !== res.winner.phone) list.push(c); });
      return list.map((c, i) => ({ rank: i + 1, phone: c.phone, username: c.username, stats: c.d }));
    }
    // رکورد: هر آمار نفر اول را با آمار نفر اولِ دوره‌ی قبل مقایسه می‌کند (بدون نفر اول قبلی = بدون نشان رکورد)
    function computeRecordFlags(stats, prevStats) {
      if (!stats || !prevStats) return null;
      const a = levelVals(stats), b = levelVals(prevStats);
      return a.map((v, i) => v > b[i]);
    }
    function applyContestPrizes(rec, prevKey, curKey) {
      const users = getUsersDatabase();
      const poolBefore = readGiftPool();
      const pool = poolBefore.slice();
      const now = Date.now();
      const rankFa = ['اول', 'دوم', 'سوم'];
      rec.podium.forEach(p => {
        const prize = CONTEST_PRIZES[p.rank - 1];
        const u = users.find(x => x.phone === p.phone);
        if (!prize || !u) return;
        if (!Array.isArray(u.userVouchers)) u.userVouchers = [];
        // قانون سایت: دو کد هم‌درصد هم‌زمان مجاز نیست؛ کد هم‌درصد قبلی (اگر بود) جایگزین می‌شود
        u.userVouchers = u.userVouchers.filter(v => v.percent !== prize.pct);
        const code = generateVoucherCode('CUP' + p.rank);
        u.userVouchers.push({
          labelFa: 'جایزه‌ی مسابقه‌ی ' + monthNameOf(prevKey, 'fa') + ' - نفر ' + rankFa[p.rank - 1] + ' (' + prize.pct + '٪):',
          labelEn: 'Contest prize ' + monthNameOf(prevKey, 'en') + ' - rank ' + p.rank + ' (' + prize.pct + '%):',
          code: code,
          percent: prize.pct
        });
        if (!rec.giftWithheld) {
          pool.push({ id: 'g' + now + p.rank, phone: u.phone, username: u.username, rank: p.rank, periodKey: curKey, quota: prize.gift, filled: 0, createdAt: now });
        }
      });
      // اگر هر کدام از این دو ذخیره نشود، هیچ تغییری باقی نمی‌ماند و false برمی‌گردد
      if (!writeGiftPool(pool)) return false;
      if (!saveUsersDatabase(users)) { writeGiftPool(poolBefore); return false; }
      rec.podium.forEach(p => {
        sendInboxMessage(p.phone, p.rank === 1 ? buildWinnerMessage(rec, prevKey, curKey) : buildPodiumMessage(p, rec, prevKey, curKey));
      });
      return true;
    }
    function buildPrizeLines(lang, rank, withheld) {
      const fa = lang === 'fa';
      const prize = CONTEST_PRIZES[rank - 1];
      const N = n => fmtL(lang, n);
      const lines = [];
      lines.push(fa
        ? `• یک کد تخفیف ${N(prize.pct)}٪ به بخش «کدهای تخفیف» پنل شما اضافه شد.`
        : `• A ${prize.pct}% discount code was added to your "Discount codes" list.`);
      if (withheld) {
        lines.push(fa
          ? '• جایزه‌ی زیرمجموعه‌ی هدیه این ماه داده نمی‌شود، چون چارت هدیه‌ی برندگان قبلی هنوز کامل نشده است؛ بعد از کامل شدن آن‌ها، دوباره در جوایز قرار می‌گیرد.'
          : '• The gift-referral prize is not awarded this month because earlier winners\' gift charts are not complete yet; it returns once they are.');
      } else {
        lines.push(fa
          ? `• ${N(prize.gift)} زیرمجموعه‌ی هدیه: کاربرانی که بدون کد معرف ثبت‌نام کنند به‌صورت تصادفی به زیرمجموعه‌ی شما اضافه می‌شوند و پیشرفت آن را در پنل می‌بینید. پورسانت خرید آن‌ها مثل بقیه‌ی زیرمجموعه‌ها به شما می‌رسد، ولی در تخفیف پلکانی و باز شدن آواتارها حساب نمی‌شوند.`
          : `• ${prize.gift} gift referrals: users who sign up without a referral code are randomly added to your network and you can follow the progress in your panel. You earn commission on their purchases like any referral, but they do not count toward tiered discounts or avatar unlocks.`);
      }
      return lines.join('\n');
    }
    function buildWinnerMessage(rec, prevKey, curKey) {
      const mk = lang => {
        const N = n => fmtL(lang, n);
        const s = rec.stats;
        const cur = monthNameOf(curKey, lang), prev = monthNameOf(prevKey, lang);
        return lang === 'fa' ? {
          title: `🏆 تبریک! شما نفر اول مسابقه‌ی ${prev} شدید`,
          body: `مسابقه‌ی ${prev} به پایان رسید و شما با ${N(s.books)} کتاب، ${N(s.refs)} زیرمجموعه، ${N(s.readMinutes)} دقیقه مطالعه و ${N(s.presenceMinutes)} دقیقه حضور در سایت رتبه‌ی اول را گرفتید.\n\nجوایز شما:\n${buildPrizeLines('fa', 1, rec.giftWithheld)}\n• تا اعلام نفر بعدی می‌توانید از ✨ در لیست آواتار، عکس اختصاصی خود را برای بررسی مدیر بفرستید.\n\n✍️ نوار «علایق» در پنل شما فعال شد: می‌توانید یک متن کوتاه (حداکثر ۱۵۰ کاراکتر) درباره‌ی علایق‌تان بنویسید تا بعد از تأیید مدیر برای همه نمایش داده شود. فقط یک بار می‌توانید بنویسید و بعد از تأیید قابل تغییر نیست، مگر اینکه مدیر آن را رد کند.`
        } : {
          title: `🏆 Congratulations! You are #1 of the ${prev} contest`,
          body: `The ${prev} contest is over and you ranked #1 with ${N(s.books)} book(s), ${N(s.refs)} referral(s), ${N(s.readMinutes)} reading minutes and ${N(s.presenceMinutes)} minutes on the site.\n\nYour prizes:\n${buildPrizeLines('en', 1, rec.giftWithheld)}\n• Until the next winner is announced you can tap ✨ in the avatar list and submit your personalized photo for admin review.\n\n✍️ The "Interests" bar is now active in your panel: write a short text (max 150 characters) about your interests and, once management approves it, everyone will see it. You can write only once and it cannot be changed after approval unless management rejects it.`
        };
      };
      return { kind: 'champion', fa: mk('fa'), en: mk('en') };
    }
    function buildPodiumMessage(p, rec, prevKey, curKey) {
      const mk = lang => {
        const N = n => fmtL(lang, n);
        const s = p.stats;
        const prev = monthNameOf(prevKey, lang);
        const rk = lang === 'fa' ? ['اول', 'دوم', 'سوم'][p.rank - 1] : ('#' + p.rank);
        return lang === 'fa' ? {
          title: `🥈 تبریک! شما نفر ${rk} مسابقه‌ی ${prev} شدید`.replace('🥈', p.rank === 3 ? '🥉' : '🥈'),
          body: `مسابقه‌ی ${prev} به پایان رسید و شما با ${N(s.books)} کتاب، ${N(s.refs)} زیرمجموعه، ${N(s.readMinutes)} دقیقه مطالعه و ${N(s.presenceMinutes)} دقیقه حضور در سایت رتبه‌ی ${rk} را گرفتید.\n\nجوایز شما:\n${buildPrizeLines('fa', p.rank, rec.giftWithheld)}`
        } : {
          title: `${p.rank === 3 ? '🥉' : '🥈'} Congratulations! You ranked ${rk} in the ${prev} contest`,
          body: `The ${prev} contest is over and you ranked ${rk} with ${N(s.books)} book(s), ${N(s.refs)} referral(s), ${N(s.readMinutes)} reading minutes and ${N(s.presenceMinutes)} minutes on the site.\n\nYour prizes:\n${buildPrizeLines('en', p.rank, rec.giftWithheld)}`
        };
      };
      return { kind: 'champion', fa: mk('fa'), en: mk('en') };
    }

    function buildExcludedMessage(rec, prevKey, curKey) {
      const mk = lang => {
        const next = monthNameOf(getAdjacentMonthKey(+1), lang), prev = monthNameOf(prevKey, lang);
        const others = Math.max((rec.tiedCount || 2) - 1, 1);
        return lang === 'fa' ? {
          title: '📢 نتیجه‌ی رقابت ماه گذشته',
          body: `ماه قبل برنده بودید. اما رقابت ${prev} بین شما و ${fmtL('fa', others)} نفر دیگر دقیقاً مساوی تمام شد و طبق قانون سایت، در حالت تساوی برنده‌ی ماه قبل انتخاب نمی‌شود.\nبرنده بین بقیه‌ی هم‌امتیازها با محاسبه‌ی دقیق‌تر (تا سطح ثانیه) مشخص شد.\nبرای برنده شدن در ${next} از همین امروز تلاش کنید.`
        } : {
          title: '📢 Last month\'s contest result',
          body: `You were last month's winner. The ${prev} contest ended in an exact tie between you and ${others} other user(s), and by site rules the previous winner is not selected in a tie.\nThe winner was chosen among the others using a finer calculation (down to seconds).\nKeep competing to win ${next}.`
        };
      };
      return { kind: 'champion', fa: mk('fa'), en: mk('en') };
    }

    // ----- صندوق پیام مدیریت (پیام‌های سیستمی، اعلام برنده و پاسخ پرسش‌ها) -----
    // msg = { kind, fa: {title, body}, en: {title, body} }؛ extra (اختیاری) فیلدهایی است که همزمان روی خود کاربر ذخیره می‌شود
    function sendInboxMessage(phone, msg, extra) {
      const users = getUsersDatabase();
      const u = users.find(x => x.phone === phone);
      if (!u) return false;
      if (!Array.isArray(u.inbox)) u.inbox = [];
      u.inbox.unshift({
        id: 'm' + Date.now() + Math.random().toString(36).slice(2, 6),
        ts: Date.now(),
        kind: msg.kind || 'system',
        fa: msg.fa || msg.en,
        en: msg.en || msg.fa,
        read: false
      });
      if (u.inbox.length > 40) u.inbox.length = 40;
      if (extra) Object.assign(u, extra);
      saveUsersDatabase(users);
      if (currentActiveUser && currentActiveUser.phone === phone) {
        currentActiveUser.inbox = u.inbox;
        if (extra) Object.assign(currentActiveUser, extra);
        localStorage.setItem('pdf_market_active_session', JSON.stringify(currentActiveUser));
      }
      return true;
    }

    // آیا این کاربر «برنده‌ی همین ماه» است؟ (یعنی دارنده‌ی حق عکس اختصاصی در ماه جاری)
    function isUserChampionThisMonth(user) {
      const rec = finalizeMonthlyChampion();
      return !!rec.phone && rec.phone === user.phone;
    }

    // وضعیت فعلی آیتم «آواتار اختصاصی» در شبکه‌ی آواتارها برای این کاربر
    function getVipItemState(user) {
      const unlockedCount = getVipUnlockedCount(user);
      const eligible = unlockedCount >= 9;   // شرط اولیه: باز کردن حداقل ۹ آواتار از لیست
      const monthKey = getCurrentMonthKey();
      const stats = getUserMonthlyDetail(user, monthKey);
      const isTop = eligible && isUserChampionThisMonth(user);

      let state;
      if (!eligible) state = 'locked';
      else if (user.pendingAvatarImage) state = 'pending';
      else if (!isTop) state = 'competing';
      else if (user.avatar && user.avatar.startsWith('data:image')) state = 'active';
      else state = 'ready';

      return { state, unlockedCount, eligible, isTop, stats, monthKey };
    }

    // بررسی همه‌ی کاربران: عکس اختصاصی (یا عکس در انتظار تایید) فقط برای برنده‌ی همین ماه می‌ماند.
    // چون برنده در طول ماه ثابت است، وسط ماه هیچ عکسی به‌خاطر نوسان رتبه پاک نمی‌شود؛ فقط هنگام شروع ماه جدید.
    function enforceMonthlyChampionState() {
      const rec = finalizeMonthlyChampion();
      const users = getUsersDatabase();
      const removedPhotoPhones = [];
      const cancelledPendingPhones = [];

      users.forEach(u => {
        if (rec.phone && rec.phone === u.phone) return;   // برنده‌ی این ماه
        const hasActivePhoto = u.avatar && typeof u.avatar === 'string' && u.avatar.startsWith('data:image');
        const fallback = () => { const { unlocked } = getUnlockedAvatarList(u); return unlocked[0] || '👤'; };

        if (u.pendingAvatarImage) {
          // عکسی که منتظر تایید بود ولی صاحبش دیگر برنده‌ی این ماه نیست: لغو می‌شود
          if (u.avatar === '⏳' || !u.avatar) u.avatar = u.previousAvatar || fallback();
          delete u.pendingAvatarImage;
          delete u.pendingAvatarSubmittedAt;
          delete u.previousAvatar;
          cancelledPendingPhones.push(u.phone);
        }
        if (hasActivePhoto) {
          u.avatar = fallback();
          delete u.avatarApprovedAt;
          delete u.customAvatarApprovedMonthKey;
          removedPhotoPhones.push(u.phone);
        }
      });

      if (removedPhotoPhones.length || cancelledPendingPhones.length) {
        saveUsersDatabase(users);
        if (currentActiveUser) {
          const fresh = users.find(u => u.phone === currentActiveUser.phone);
          if (fresh) {
            currentActiveUser = fresh;
            localStorage.setItem('pdf_market_active_session', JSON.stringify(currentActiveUser));
          }
        }
        const cur = getCurrentMonthKey();
        removedPhotoPhones.forEach(p => sendInboxMessage(p, {
          kind: 'champion',
          fa: { title: '📢 پایان دوره‌ی عکس اختصاصی', body: `دوره‌ی یک‌ماهه‌ی عکس اختصاصی شما تمام شد و ${monthNameOf(cur, 'fa')} برنده‌ی دیگری دارد؛ آواتار شما به یکی از آواتارهای بازشده‌تان برگشت. برای برنده شدن در ماه بعد تلاش کنید.` },
          en: { title: '📢 Custom photo period ended', body: `Your one-month custom photo period is over and ${monthNameOf(cur, 'en')} has a different winner; your avatar went back to one of your unlocked avatars. Keep competing for next month.` }
        }));
        cancelledPendingPhones.forEach(p => sendInboxMessage(p, {
          kind: 'champion',
          fa: { title: '📢 عکس اختصاصی لغو شد', body: 'عکسی که برای تایید فرستاده بودید لغو شد، چون شما برنده‌ی این ماه نیستید.' },
          en: { title: '📢 Custom photo cancelled', body: 'The photo you submitted for review was cancelled because you are not this month\'s winner.' }
        }));
      }
    }

    // ----- وضعیت رقابت جاری (برای کادر عمومی، دیالوگ‌ها و پیام یک روز مانده به پایان ماه) -----
    function getStandingSummary(user) {
      const curKey = getCurrentMonthKey();
      const nextKey = getAdjacentMonthKey(+1);
      const rec = finalizeMonthlyChampion();
      const comp = computeCompetition(curKey, rec.phone);
      const idx = user ? comp.ranking.findIndex(c => c.phone === user.phone) : -1;
      const me = idx >= 0 ? comp.ranking[idx] : null;
      const mineD = me ? me.d : (user ? getUserMonthlyDetail(user, curKey) : null);
      return {
        curKey, nextKey, rec, comp, me, mineD,
        rank: idx >= 0 ? idx + 1 : null,
        leader: comp.winner,
        daysLeft: getContestDaysLeft(new Date())
      };
    }

    // سریع‌ترین راه برای جلو زدن از نفر اول: اولین سطحی که عقب هستید را پر می‌کنید
    function fastestPath(mine, lead) {
      let i = 0;
      while (i < 4 && mine[i] === lead[i]) i++;
      if (i >= 4 || mine[i] > lead[i]) return null;
      const diff = lead[i] - mine[i];
      let tailWin = false;
      for (let j = i + 1; j < 4; j++) {
        if (mine[j] !== lead[j]) { tailWin = mine[j] > lead[j]; break; }
      }
      return { level: i, need: diff + (tailWin ? 0 : 1) };
    }
    function pathText(lang, p) {
      const fa = lang === 'fa';
      const N = fmtL(lang, p.need);
      if (p.level === 0) return fa ? `خرید ${N} کتاب دیگر` : `buy ${N} more book(s)`;
      if (p.level === 1) return fa ? `دعوت ${N} نفر دیگر به‌عنوان زیرمجموعه` : `refer ${N} more user(s)`;
      if (p.level === 2) {
        const hrs = p.need >= 60 ? (fa ? ` (حدود ${fmtL(lang,Math.round(p.need/6)/10)} ساعت)` : ` (about ${fmtL(lang,Math.round(p.need/6)/10)} hours)`) : '';
        return fa ? `${N} دقیقه مطالعه‌ی بیشتر${hrs}` : `${N} more minutes of reading${hrs}`;
      }
      return fa ? `${N} دقیقه حضور بیشتر در سایت` : `${N} more minutes on the site`;
    }
    function statsLine(lang, v) {
      const N = n => fmtL(lang, n);
      return lang === 'fa'
        ? `${N(v[0])} کتاب، ${N(v[1])} زیرمجموعه، ${N(v[2])} دقیقه مطالعه، ${N(v[3])} دقیقه حضور`
        : `${N(v[0])} book(s), ${N(v[1])} referral(s), ${N(v[2])} reading min, ${N(v[3])} min on site`;
    }

    // متن پیام «یک روز مانده به پایان ماه» فقط برای دارنده‌ی عنوان این ماه
    function buildEndNotice(lang, ctx) {
      const fa = lang === 'fa';
      const N = n => fmtL(lang, n);
      const cur = monthNameOf(ctx.curKey, lang);
      const next = monthNameOf(ctx.nextKey, lang);
      const mine = ctx.mine;
      const lines = [];
      let title;

      if (!ctx.leader) {
        title = fa ? '⏰ یک روز مانده به پایان رقابت' : '⏰ One day left in the contest';
        lines.push(fa
          ? `رقابت برای عنوان ${next} تا پایان ${cur} ادامه دارد و تا این لحظه هیچ‌کس امتیازی ثبت نکرده است. با هر فعالیتی (مثلاً چند دقیقه مطالعه) همین حالا اول می‌شوید.`
          : `The contest for the ${next} title runs until the end of ${cur} and nobody has scored yet. Any activity (even a few minutes of reading) puts you in first place right now.`);
      } else if (ctx.iAmLeader) {
        title = fa ? '🏆 فعلاً رتبه‌ی اول هستید' : '🏆 You are currently ranked #1';
        lines.push(fa
          ? `در رقابت برای عنوان ${next} فعلاً اول هستید. اگر تا پایان ${cur} همین‌طور بمانید، عکس اختصاصی برای ماه بعد هم برای شما می‌ماند.`
          : `You are #1 in the contest for the ${next} title. If it stays this way until the end of ${cur}, you keep the custom photo next month too.`);
        lines.push((fa ? 'امتیاز شما: ' : 'Your points: ') + statsLine(lang, mine));
        if (ctx.second) {
          const sv = levelVals(ctx.second.d);
          const i = mine.findIndex((v, k) => v !== sv[k]);
          if (i >= 0) {
            lines.push(fa
              ? `نفر دوم «${ctx.second.username}» است و در «${CHAMP_LEVELS[i].fa}» ${N(mine[i]-sv[i])} واحد از شما عقب‌تر است. برای اینکه جا نزنند، تا آخرین لحظه فعال بمانید.`
              : `Second place is "${ctx.second.username}", ${N(mine[i]-sv[i])} behind you in "${CHAMP_LEVELS[i].en}". Stay active until the last moment to keep the lead.`);
          }
        }
      } else if (ctx.iAmExcluded) {
        title = fa ? '⚠️ رقابت شما مساوی است' : '⚠️ Your contest score is tied';
        lines.push(fa
          ? `امتیاز شما با ${N(Math.max(ctx.comp.tiedCount-1,1))} نفر دیگر دقیقاً مساوی است. چون ماه قبل برنده بودید، در حالت تساوی طبق قانون سایت انتخاب نمی‌شوید و برنده بین بقیه مشخص می‌شود.`
          : `Your score is exactly tied with ${N(Math.max(ctx.comp.tiedCount-1,1))} other user(s). Because you won last month, the previous winner is not selected in a tie, and the winner is picked among the others.`);
        lines.push((fa ? 'امتیاز شما: ' : 'Your points: ') + statsLine(lang, mine));
        lines.push(fa
          ? 'سریع‌ترین راه: با یک امتیاز بیشتر (حتی ۱ دقیقه مطالعه) از حالت تساوی خارج می‌شوید و اول می‌شوید.'
          : 'Fastest way: any extra point (even 1 more minute of reading) breaks the tie and puts you first.');
      } else {
        const lv = levelVals(ctx.leader.d);
        title = fa ? '⏰ یک روز مانده؛ فعلاً اول نیستید' : '⏰ One day left; you are not #1 yet';
        const i = mine.findIndex((v, k) => v !== lv[k]);
        if (!ctx.hasActivity) {
          lines.push(fa
            ? `در ${cur} هنوز فعالیتی از شما ثبت نشده و نفر اول «${ctx.leader.username}» است.`
            : `No activity from you has been recorded in ${cur} yet, and "${ctx.leader.username}" is #1.`);
        } else if (i >= 0) {
          lines.push(fa
            ? `چرا اول نیستید؟ «${ctx.leader.username}» در «${CHAMP_LEVELS[i].fa}» ${N(lv[i])} دارد و شما ${N(mine[i])}. اولویت امتیاز به ترتیب: خرید کتاب، زیرمجموعه، دقایق مطالعه، دقایق حضور.`
            : `Why not #1? "${ctx.leader.username}" has ${N(lv[i])} in "${CHAMP_LEVELS[i].en}" and you have ${N(mine[i])}. Priority order: books, referrals, reading minutes, minutes on site.`);
        }
        lines.push((fa ? 'امتیاز نفر اول: ' : 'Leader\'s points: ') + statsLine(lang, lv));
        lines.push((fa ? 'امتیاز شما: ' : 'Your points: ') + statsLine(lang, mine));
        const p = fastestPath(mine, lv);
        if (p) {
          lines.push(fa
            ? `سریع‌ترین راه برای اول شدن: ${pathText(lang,p)}.`
            : `Fastest way to reach #1: ${pathText(lang,p)}.`);
        }
      }
      return { title, body: lines.join('\n') };
    }

    // یک روز مانده به پایان ماه، فقط برای دارنده‌ی عنوان همین ماه (یک بار در هر ماه)
    function checkChampionEndNotice() {
      if (!currentActiveUser) return;
      if (getContestDaysLeft(new Date()) > 2) return;
      const rec = finalizeMonthlyChampion();
      if (!rec.phone || rec.phone !== currentActiveUser.phone) return;
      const fresh = getUsersDatabase().find(u => u.phone === currentActiveUser.phone);
      const curKey = getCurrentMonthKey();
      if (!fresh || fresh.champEndNoticeMonthKey === curKey) return;

      const sum = getStandingSummary(fresh);
      const iAmLeader = !!(sum.leader && sum.leader.phone === fresh.phone);
      const iAmExcluded = !!(sum.comp.excluded && sum.comp.excluded.phone === fresh.phone);
      const mine = levelVals(sum.mineD);
      const ctx = {
        curKey: sum.curKey, nextKey: sum.nextKey, comp: sum.comp, leader: sum.leader,
        iAmLeader, iAmExcluded, mine,
        hasActivity: !!sum.me,
        second: iAmLeader ? (sum.comp.ranking.find(c => c.phone !== fresh.phone) || null) : null
      };
      sendInboxMessage(fresh.phone, { kind: 'champion', fa: buildEndNotice('fa', ctx), en: buildEndNotice('en', ctx) }, { champEndNoticeMonthKey: curKey });
    }

    // ----- نمایش کادر پیام مدیریت و کادر عمومی رقابت داخل پنل کاربری -----
    function markAllInboxRead() {
      if (!currentActiveUser) return;
      const users = getUsersDatabase();
      const u = users.find(x => x.phone === currentActiveUser.phone);
      if (!u || !Array.isArray(u.inbox)) return;
      u.inbox.forEach(m => { m.read = true; });
      saveUsersDatabase(users);
      currentActiveUser.inbox = u.inbox;
      localStorage.setItem('pdf_market_active_session', JSON.stringify(currentActiveUser));
      renderInbox();
      renderChampionCards();
    }
    function renderInbox() {
      const list = document.getElementById('panelInboxList');
      const titleEl = document.getElementById('panelInboxTitle');
      const readAllBtn = document.getElementById('panelInboxReadAllBtn');
      if (!list || !currentActiveUser) return;
      const fa = currentLang === 'fa';
      const msgs = Array.isArray(currentActiveUser.inbox) ? currentActiveUser.inbox : [];
      const unread = msgs.filter(m => !m.read).length;
      titleEl.textContent = (fa ? '📩 پیام از مدیریت' : '📩 Message from Management') + (unread ? ` (${fmtL(currentLang,unread)})` : '');
      readAllBtn.style.display = unread ? 'inline-block' : 'none';
      readAllBtn.textContent = fa ? 'خوانده شد' : 'Mark as read';
      if (msgs.length === 0) {
        list.innerHTML = `<p style="color:var(--text-muted); font-size:0.8rem; line-height:1.8; margin:4px 0;">${fa
          ? 'هنوز پیامی ندارید. پاسخ پرسش‌ها، اعلام برنده‌ی ماهانه و اخبار رقابت آواتار اختصاصی اینجا نمایش داده می‌شود.'
          : 'No messages yet. Answers to your questions, monthly winner announcements and contest news will appear here.'}</p>`;
        return;
      }
      list.innerHTML = msgs.map(m => {
        const c = m[currentLang] || m.fa || { title: '', body: '' };
        const when = new Date(m.ts).toLocaleString(fa ? 'fa-IR' : 'en-US');
        const body = escapeHtml(c.body).replace(/\n/g, '<br>');
        return `
          <div style="border:1px solid ${m.read ? 'var(--border)' : 'var(--primary)'}; ${m.read ? '' : 'background:rgba(201,92,92,0.06);'} border-radius:10px; padding:8px 10px; margin-bottom:8px;">
            <div style="display:flex; justify-content:space-between; gap:8px; align-items:baseline;">
              <strong style="font-size:0.85rem;">${escapeHtml(c.title)}</strong>
              <span style="font-size:0.68rem; color:var(--text-muted); white-space:nowrap;">${when}</span>
            </div>
            <div style="font-size:0.8rem; line-height:1.9; margin-top:4px;">${body}</div>
          </div>`;
      }).join('');
    }
    function renderChampionCards() {
      const body = document.getElementById('panelChampionBody');
      const titleEl = document.getElementById('panelChampionTitle');
      const panelNameBtn = document.getElementById('userPanelNameBtn');
      if (!body || !currentActiveUser) return;
      const fa = currentLang === 'fa';
      const N = n => fmtL(currentLang, n);

      const unread = (currentActiveUser.inbox || []).filter(m => !m.read).length;
      if (panelNameBtn) panelNameBtn.textContent = currentActiveUser.username + (unread ? ' 🔴' : '');
      renderInbox();

      const sum = getStandingSummary(currentActiveUser);
      const curName = monthNameOf(sum.curKey, currentLang);
      const nextName = monthNameOf(sum.nextKey, currentLang);
      titleEl.textContent = fa ? '🏆 رقابت آواتار اختصاصی' : '🏆 Custom Avatar Contest';

      const holderUser = sum.rec.phone ? getUsersDatabase().find(u => u.phone === sum.rec.phone) : null;
      const holderName = holderUser ? holderUser.username : (sum.rec.username || null);
      const mineV = sum.mineD ? levelVals(sum.mineD) : [0, 0, 0, 0];
      const leadV = sum.leader ? levelVals(sum.leader.d) : null;
      const eligible = isVipEligible(currentActiveUser);

      const cell = 'padding:3px 6px; border-top:1px dashed var(--border);';
      let html = '';
      html += `<div>🏅 ${fa?`برنده‌ی ${curName} (دارنده‌ی عکس اختصاصی)`:`${curName} winner (custom photo holder)`}: <strong>${holderName ? escapeHtml(holderName) : (fa ? 'برنده‌ای نبود' : 'no winner')}</strong></div>`;
      html += `<div>🎯 ${fa?`پیشتاز رقابت برای ${nextName}`:`Current leader for ${nextName}`}: <strong>${sum.leader ? escapeHtml(sum.leader.username) : (fa ? 'هنوز کسی امتیاز نگرفته' : 'nobody has scored yet')}</strong></div>`;
      html += `<div style="display:grid; grid-template-columns:1.6fr 1fr 1fr; margin-top:6px; font-size:0.78rem; text-align:center;">`;
      html += `<div style="padding:3px 6px;"></div><div style="padding:3px 6px; font-weight:700;">${fa ? 'پیشتاز' : 'Leader'}</div><div style="padding:3px 6px; font-weight:700;">${fa ? 'شما' : 'You'}</div>`;
      CHAMP_LEVELS.forEach((lv, i) => {
        html += `<div style="${cell} text-align:${fa ? 'right' : 'left'};">${fa ? lv.fa : lv.en}</div>`;
        html += `<div style="${cell}">${leadV ? N(leadV[i]) : '—'}</div>`;
        html += `<div style="${cell}">${N(mineV[i])}</div>`;
      });
      html += `</div>`;
      if (!eligible) {
        html += `<div style="font-size:0.76rem; color:#c98a1b; margin-top:6px;">${fa?`برای ورود به رقابت باید حداقل ۹ آواتار باز کنید (${N(getVipUnlockedCount(currentActiveUser))} از ۹).`:`To enter the contest you must unlock at least 9 avatars (${N(getVipUnlockedCount(currentActiveUser))} of 9).`}</div>`;
      } else if (sum.rank) {
        html += `<div style="font-size:0.76rem; margin-top:6px;">${fa?`رتبه‌ی شما: ${N(sum.rank)} از ${N(sum.comp.ranking.length)}`:`Your rank: ${N(sum.rank)} of ${N(sum.comp.ranking.length)}`}</div>`;
      }
      html += `<div style="font-size:0.74rem; color:var(--text-muted); margin-top:6px; line-height:1.8;">⏳ ${fa?`${N(sum.daysLeft)} روز تا پایان رقابت (امروز هم حساب می‌شود). اولویت امتیاز: خرید کتاب، زیرمجموعه، دقایق مطالعه، دقایق حضور در سایت. برنده در پایان ${curName} اعلام می‌شود و فقط در ${nextName} عکس اختصاصی دارد.`:`${N(sum.daysLeft)} day(s) left (today included). Priority: books, referrals, reading minutes, minutes on site. The winner is announced at the end of ${curName} and holds the custom photo only during ${nextName}.`}</div>`;
      body.innerHTML = html;
    }

    // متن شرایط اختصاصی یک آواتار خاص (بدون آیکون شروع، چون در جای مصرف آیکون مناسب اضافه می‌شود)
    // def همون آیتم زنجیره‌ست: { icon, type, incBooks, incMins, incRefs, progBooks, progMins, progRefs, isActive, unlocked, cssClass? }
    // توجه: progBooks/progMins/progRefs فقط از لحظه‌ای که نوبتِ این آواتار شروع شده حساب می‌شن، نه از اول حساب کاربر
    function getAvatarRequirementText(def) {
      const fa = currentLang === 'fa';
      const N = n => fmtL(currentLang, n);

      const lines = [];
      if (def.incBooks > 0) {
        const remain = Math.max(0, def.incBooks - (def.progBooks || 0));
        lines.push(fa
          ? `- خرید ${N(def.incBooks)} کتاب جدید (${remain === 0 ? 'تکمیل شده ✅' : 'نیازمند ' + N(remain) + ' کتاب دیگر'})`
          : `- Buy ${N(def.incBooks)} new book(s) (${remain === 0 ? 'done ✅' : 'need ' + N(remain) + ' more'})`);
      }
      if (def.incMins > 0) {
        const remainMins = Math.max(0, def.incMins - (def.progMins || 0));
        lines.push(fa
          ? `- ${(def.incMins/60).toFixed(1)} ساعت مطالعه‌ی جدید (${remainMins === 0 ? 'تکمیل شده ✅' : 'نیازمند ' + (remainMins/60).toFixed(1) + ' ساعت دیگر'})`
          : `- ${(def.incMins/60).toFixed(1)} new reading hours (${remainMins === 0 ? 'done ✅' : 'need ' + (remainMins/60).toFixed(1) + ' more hours'})`);
      }
      if (def.incRefs > 0) {
        const remain = Math.max(0, def.incRefs - (def.progRefs || 0));
        lines.push(fa
          ? `- دعوت ${N(def.incRefs)} زیرمجموعه‌ی جدید (${remain === 0 ? 'تکمیل شده ✅' : 'نیازمند ' + N(remain) + ' نفر دیگر'})`
          : `- Invite ${N(def.incRefs)} new referrals (${remain === 0 ? 'done ✅' : 'need ' + N(remain) + ' more'})`);
      }

      const title = fa
        ? '📌 این شرط از لحظه‌ای که نوبتِ این آواتار می‌رسه حساب می‌شه؛ کارهایی که قبل از رسیدن نوبتش انجام دادی حساب نمی‌شن:'
        : "📌 This requirement counts only from the moment this avatar's turn starts; anything done before its turn doesn't count:";
      return title + '\n' + lines.join('\n');
    }

    // آیکون مناسب برای نمایش کنار متن شرط
    function getAvatarIcon(def) { return def.cssClass ? '⭐' : '🔒'; }

    // کلیک روی یک آواتار قفل: فقط آواتاری که همین الان نوبتشه («فعال») شرط قابل‌تلاش داره.
    // بقیه، حتی اگه از قبل شرایط عددیِ خودشون برقرار باشه، باید صبر کنن تا نوبتشون برسه؛
    // و از همون لحظه‌ی رسیدن نوبت، شمارش شرط‌شون از صفر شروع می‌شه
    function checkAvatarCondition(item) {
      const fa = currentLang === 'fa';
      const { chain, activeIndex } = getUnlockedAvatarList(currentActiveUser);
      const myIndex = chain.findIndex(c => c.icon === item.icon);
      if (myIndex === -1) return;

      if (myIndex > activeIndex) {
        // نوبت این آواتار هنوز نرسیده: باید اول آواتار فعال (و هر چی قبل از خودشه) باز بشه
        const activeDef = chain[activeIndex];
        const queueNo = activeIndex + 1;
        const totalLocked = chain.length;
        const prefix = fa
          ? `⏸️ نوبت این آواتار هنوز نرسیده. اول باید آواتار(های) قبل از خودش رو به‌ترتیب باز کنی (الان نوبت آواتار شماره ${queueNo} از ${totalLocked} است). حتی اگه از قبل شرایط عددیِ این آواتار رو داشته باشی حساب نمی‌شه؛ وقتی نوبتش برسه، باید از همون لحظه دوباره براش تلاش کنی:\n\n`
          : `⏸️ This avatar's turn hasn't come yet. You must unlock the avatar(s) before it first, in order (it's currently avatar #${queueNo} of ${totalLocked}'s turn). Even if you already meet its numeric requirements, it won't count — once its turn starts, you'll need to earn it again from that point:\n\n`;
        alert(prefix + getAvatarRequirementText(activeDef));
        return;
      }

      // این همون آواتار فعاله؛ شرط اختصاصی و پیشرفت فعلیِ خودش رو نشون بده
      alert(getAvatarIcon(chain[myIndex]) + ' ' + getAvatarRequirementText(chain[myIndex]));
    }

    // آواتارهای رنگی و شیک — تعادل دختر/پسر رعایت شده (۶ رایگان + ۱۹ قفل)
    const AVATAR_MALE_SEEDS = new Set(['Akira', 'Ken', 'Sora', 'Ryu', 'Hiro', 'Ren', 'Kai', 'Yuki', 'Toru', 'Shin', 'Haru', 'Kaito', 'Riku']);
    const AVATAR_FEMALE_SEEDS = new Set(['Aiko', 'Sakura', 'Mio', 'Miku', 'Hana', 'Rin', 'Nana', 'Yui', 'Saki', 'Hina', 'Emi', 'Luna']);
    const AVATAR_SHORT_HAIR = 'short01,short02,short03,short04,short05,short06,short07,short08,short09,short10,short11,short12,short13,short14,short15,short16,short17,short18,short19';
    const AVATAR_LONG_HAIR = 'long01,long02,long03,long04,long05,long06,long07,long08,long09,long10,long11,long12,long13,long14,long15,long16,long17,long18,long19,long20,long21,long22,long23,long24,long25,long26';
    const AVATAR_UNISEX_HAIR = 'short05,short10,short14,short19,long03,long09,long15,long20';
    const AVATAR_ALL_SEEDS = ['Akira', 'Ken', 'Sora', 'Aiko', 'Sakura', 'Mio',
      'Ryu', 'Hiro', 'Miku', 'Ren', 'Hana', 'Kai', 'Rin', 'Yuki', 'Nana',
      'Toru', 'Yui', 'Shin', 'Saki', 'Haru', 'Hina', 'Kaito', 'Riku', 'Emi', 'Luna'];

    function avatarGenderParams(seed) {
      if (AVATAR_MALE_SEEDS.has(seed)) return `hair=${AVATAR_SHORT_HAIR}&features=mustache&featuresProbability=100&earringsProbability=0`;
      if (AVATAR_FEMALE_SEEDS.has(seed)) return `hair=${AVATAR_LONG_HAIR}&features=blush,freckles&featuresProbability=25&earringsProbability=55`;
      return ''; // برای موارد خاص دیگر
    }

    // ایموجی نماینده‌ی هر شخصیت کارتونی (شکل واقعی شخصیت، بدون مشکل کپی‌رایت)
    const CHARACTER_EMOJI = {
      Alex: '🦁', Marty: '🦓', Melman: '🦒', Skipper: '🐧', Manny: '🦣', Diego: '🐯', Scrat: '🐿️', KingJulien: '🐒',
      Gloria: '🦛', Ellie: '🐘', Fiona: '👸', Tigress: '🐅', Dory: '🐠', Peach: '🍑', Merida: '🏹',
      Kowalski: '🐧', Private: '🐧', Rico: '🐧', Maurice: '🦧', Mort: '🐭',
      Crash: '🐿️', Eddie: '🐿️', Buck: '🦡', Po: '🐼', Sid: '🦥'
    };

    // آواتارهای محلی (SVG اختصاصی) — بدون اینترنت، بدون کپی‌رایت
    function avatarImgUrl(seed) {
      // تصاویر باکیفیت PNG (مثل عکس نویسنده) — مسیر: images/avatars/Name.png
      if (seed && seed !== '👤' && seed !== '✨' && seed !== '⏳') {
        var isEmoji = false;
        try { isEmoji = /\p{Extended_Pictographic}/u.test(seed); } catch (e) { isEmoji = false; }
        if (!isEmoji) {
          return 'images/avatars/' + encodeURIComponent(seed) + '.webp';
        }
      }
      const svgLib = window.AVATAR_SVG || {};
      const svg = svgLib[seed];
      if (svg) {
        return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
      }
      const em = (window.AVATAR_EMOJI_FALLBACK && window.AVATAR_EMOJI_FALLBACK[seed]) || '👤';
      const fallbackSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" ry="22" fill="#e8eef5"/><text x="50" y="62" text-anchor="middle" font-size="42">' + em + '</text></svg>';
      return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(fallbackSvg);
    }

    function avatarImgHtml(seed, extraStyle) {
      if (!seed || seed === '👤' || seed === '✨' || seed === '⏳' || /\p{Extended_Pictographic}/u.test(seed)) {
        return `<span style="font-size:1.6em; line-height:1; ${extraStyle || ''}">${escapeHtml(seed || '👤')}</span>`;
      }
      return `<img src="${avatarImgUrl(seed)}" alt="${escapeHtml(seed)}" loading="lazy" decoding="async" style="width:100%; height:100%; border-radius:22%; object-fit:cover; display:block; ${extraStyle || ''}" onerror="if(!this.dataset.fb){this.dataset.fb=1;this.style.objectFit='contain';var s=(window.AVATAR_SVG||{})[this.alt];if(s)this.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(s);}">`;
    }

    function prefetchAvatarImages() {
      // SVG محلی — نیازی به پیش‌بارگذاری شبکه نیست
    }

    // زنجیره‌ی ترتیبی باز شدن آواتارهای قفل: هر آواتار حالا شرط اختصاصی و پلکانی خودش رو داره
    // (هرچی جلوتر می‌ریم سخت‌تر می‌شه) و علاوه بر اون، فقط وقتی باز می‌شه که آواتار قبلیِ خودش در همین صف هم باز شده باشه
    // صفِ کامل آواتارهای قفل، دقیقاً به همون ترتیبی که در گرید نمایش داده می‌شن.
    // این‌ها «شرط‌های افزایشی» هستن: یعنی مقدار جدیدی که باید از لحظه‌ی رسیدن نوبتِ همون آواتار به بعد کسب بشه
    // (نه مجموع کل حساب کاربر از اول). هر آواتار کمی از قبلی سخت‌تره.
    function getLockedAvatarDefs() {
      return [
        { icon: 'Ryu',   type: 'tier1', incBooks: 1,  incMins: 600,  incRefs: 2 },
        { icon: 'Hiro',  type: 'tier1', incBooks: 2,  incMins: 630,  incRefs: 4 },
        { icon: 'Miku',  type: 'tier1', incBooks: 3,  incMins: 660,  incRefs: 6 },
        { icon: 'Ren',   type: 'tier1', incBooks: 4,  incMins: 700,  incRefs: 8 },
        { icon: 'Hana',  type: 'tier1', incBooks: 5,  incMins: 740,  incRefs: 10 },
        { icon: 'Kai',   type: 'tier1', incBooks: 6,  incMins: 780,  incRefs: 12 },
        { icon: 'Rin',   type: 'tier1', incBooks: 7,  incMins: 830,  incRefs: 14 },
        { icon: 'Yuki',  type: 'tier1', incBooks: 8,  incMins: 880,  incRefs: 16 },
        { icon: 'Nana',  type: 'tier1', incBooks: 9,  incMins: 940,  incRefs: 18 },
        { icon: 'Toru',  type: 'tier2', incBooks: 10, incMins: 1000, incRefs: 20 },
        { icon: 'Yui',   type: 'tier2', incBooks: 11, incMins: 1070, incRefs: 22 },
        { icon: 'Shin',  type: 'tier2', incBooks: 12, incMins: 1150, incRefs: 24 },
        { icon: 'Saki',  type: 'tier2', incBooks: 13, incMins: 1240, incRefs: 26 },
        { icon: 'Haru',  type: 'tier2', incBooks: 14, incMins: 1340, incRefs: 28 },
        { icon: 'Hina',  type: 'tier2', incBooks: 15, incMins: 1450, incRefs: 30 },
        { icon: 'Kaito', type: 'tier2', incBooks: 16, incMins: 1570, incRefs: 32 },
        { icon: 'Riku',  type: 'tier2', incBooks: 17, incMins: 1700, incRefs: 34 },
        { icon: 'Emi',   type: 'tier3', cssClass: 'crown-tier',   incBooks: 18, incMins: 1850, incRefs: 36 },
        { icon: 'Luna',  type: 'tier3', cssClass: 'diamond-tier', incBooks: 19, incMins: 2000, incRefs: 38 }
      ];
    }

    // وضعیتِ پیشرفتِ زنجیره‌ی آواتار روی خود کاربر ذخیره می‌شه:
    // idx = ایندکس آواتاری که الان نوبتشه (همه‌ی قبلی‌ها باز شدن)
    // baseBooks/baseMins/baseRefs = مقدار کتاب/دقیقه مطالعه/زیرمجموعه‌ی کاربر در لحظه‌ای که نوبتِ آواتار idx شروع شده
    function ensureAvatarProgress(user) {
      if (!user.avatarProgress) {
        user.avatarProgress = { idx: 0, baseBooks: 0, baseMins: 0, baseRefs: 0 };
      }
      return user.avatarProgress;
    }

    // اگر از لحظه‌ی رسیدنِ نوبتِ آواتار فعال، کاربر به‌اندازه‌ی کافی کتاب/مطالعه/زیرمجموعه‌ی «جدید» به دست آورده باشه،
    // یک قدم توی صف جلو می‌ره: آواتار فعلی باز می‌شه، نوبت به بعدی می‌رسه و خط پایه برای بعدی از همین لحظه صفر می‌شه
    function advanceAvatarChainProgress(user) {
      const defs = getLockedAvatarDefs();
      const prog = ensureAvatarProgress(user);
      if (prog.idx >= defs.length) return prog; // کل زنجیره قبلاً باز شده

      const booksCount = (user.purchasedBooks || []).length;
      const readingMins = (user.readingLogs || []).reduce((acc, l) => acc + l.minutes, 0);
      const refsCount = user.totalReferrals || 0;

      const def = defs[prog.idx];
      const gotBooks = booksCount - prog.baseBooks;
      const gotMins = readingMins - prog.baseMins;
      const gotRefs = refsCount - prog.baseRefs;

      if (gotBooks >= def.incBooks && gotMins >= def.incMins && gotRefs >= def.incRefs) {
        prog.idx += 1;
        prog.baseBooks = booksCount;
        prog.baseMins = readingMins;
        prog.baseRefs = refsCount;

        const users = getUsersDatabase();
        const uIdx = users.findIndex(u => u.phone === user.phone);
        if (uIdx !== -1) {
          users[uIdx].avatarProgress = prog;
          saveUsersDatabase(users);
        }
        if (currentActiveUser && currentActiveUser.phone === user.phone) {
          currentActiveUser.avatarProgress = prog;
          localStorage.setItem('pdf_market_active_session', JSON.stringify(currentActiveUser));
        }
      }
      return prog;
    }

    function getUnlockedAvatarList(user) {
      const unlocked = [];
      const freeAvatars = ['Akira', 'Ken', 'Sora', 'Aiko', 'Sakura', 'Mio'];
      freeAvatars.forEach(a => unlocked.push(a));

      const defs = getLockedAvatarDefs();
      const prog = advanceAvatarChainProgress(user); // با آخرین وضعیت هماهنگ می‌شه و در صورت لزوم یک قدم جلو می‌ره

      const booksCount = (user.purchasedBooks || []).length;
      const readingMins = (user.readingLogs || []).reduce((acc, l) => acc + l.minutes, 0);
      const refsCount = user.totalReferrals || 0;

      const chain = defs.map((def, i) => {
        const isUnlocked = i < prog.idx;
        if (isUnlocked) unlocked.push(def.icon);
        const isActive = i === prog.idx;
        // پیشرفتی که «از لحظه‌ی رسیدن نوبتِ این آواتار» به بعد انجام شده؛ فقط برای آواتار فعال معنا داره
        const progBooks = isActive ? Math.max(0, booksCount - prog.baseBooks) : 0;
        const progMins = isActive ? Math.max(0, readingMins - prog.baseMins) : 0;
        const progRefs = isActive ? Math.max(0, refsCount - prog.baseRefs) : 0;
        return { ...def, unlocked: isUnlocked, isActive, progBooks, progMins, progRefs };
      });

      return { unlocked, chain, activeIndex: prog.idx };
    }

    function renderAvatarGrid() {
      const container = document.getElementById('avatarGridContainer');
      enforceMonthlyChampionState(); // اول بررسی می‌شود که آیا کسی رتبه یک را از دست داده تا لیست به‌روز نمایش داده شود
      const { chain, activeIndex } = getUnlockedAvatarList(currentActiveUser);

      const allAvatars = [
        { icon: 'Akira', unlocked: true, type: 'free' }, { icon: 'Ken', unlocked: true, type: 'free' }, { icon: 'Sora', unlocked: true, type: 'free' },
        { icon: 'Aiko', unlocked: true, type: 'free' }, { icon: 'Sakura', unlocked: true, type: 'free' }, { icon: 'Mio', unlocked: true, type: 'free' },
        ...chain.map((c, i) => ({
          icon: c.icon,
          unlocked: c.unlocked,
          type: c.type,
          // «فعال» یعنی همین الان نوبت این آواتاره و پیشرفتِ کاربر از این لحظه به بعد براش حساب می‌شه
          isActive: i === activeIndex,
          // «در نوبت» یعنی این آواتار هنوز نوبتش نرسیده (پشتِ آواتار فعال یا فعال‌های بعدی قرار داره)
          waitingInQueue: !c.unlocked && i !== activeIndex,
          cssClass: c.cssClass || ''
        }))
      ];

      // آیتم «آواتار اختصاصی و شخصی‌سازی‌شده»: همیشه در لیست دیده می‌شود تا همه شرایطش را ببینند
      const vipInfo = getVipItemState(currentActiveUser);
      const vipBadgeByState = { locked: '🔒', competing: '🎯', ready: '📤', pending: '⏳', active: '🏆' };
      allAvatars.push({
        icon: '✨',
        unlocked: true,
        type: 'vip',
        cssClass: `vip-tier vip-state-${vipInfo.state}`,
        badge: vipBadgeByState[vipInfo.state]
      });

      const isPendingReview = !!currentActiveUser.pendingAvatarImage;

      if (isPendingReview) {
        // تا وقتی عکس تایید نشده، هیچ تصویری نمایش داده نمی‌شه؛ فقط یه آیتم غیرفعال «در حال بررسی» نشون داده می‌شه
        allAvatars.unshift({ icon: '⏳', unlocked: false, isPending: true });
      } else if (currentActiveUser.avatar && (currentActiveUser.avatar.startsWith('data:image') || currentActiveUser.avatar.startsWith('http'))) {
        allAvatars.unshift({ icon: currentActiveUser.avatar, unlocked: true, isImg: true });
      }

      avatarGridItems = allAvatars;
      container.innerHTML = allAvatars.map((item, idx) => {
        const pendingClass = item.isPending ? 'pending-review' : '';
        const queueClass = item.waitingInQueue ? 'in-queue' : '';
        const activeClass = item.isActive ? 'active-turn' : '';
        const extraClass = [item.cssClass, pendingClass, queueClass, activeClass].filter(Boolean).join(' ');
        const clickAction = item.isPending ? '' : `handleAvatarGridClick(${idx})`;
        // اگه همین الان نوبت این آواتاره، 🎯 نشون بده؛ اگه هنوز نوبتش نرسیده، ⏸️؛ وگرنه باز/بسته‌ی معمولی
        const badgeText = item.isPending ? '⏳' : (item.type === 'vip' ? item.badge : (item.isActive ? '🎯' : (item.waitingInQueue ? '⏸️' : (item.cssClass ? (item.unlocked ? '⭐' : '🔒') : (item.unlocked ? '✅' : '🔒')))));
        // آواتارهای رایگان و زنجیره‌ی قفل با ایموجی شخصیت کارتونی نشون داده می‌شن؛
        // آیتم‌های وضعیتی مثل «در حال بررسی» و «آواتار اختصاصی» همون آیکون خودشون رو دارن
        const isCharacterAvatar = !item.isImg && !item.isPending && item.type !== 'vip';
        const glyphInner = item.isImg
          ? `<img src="${escapeHtml(item.icon)}" style="width:100%; height:100%; border-radius:22%; object-fit:cover;">`
          : isCharacterAvatar
            ? avatarImgHtml(item.icon)
            : `<span>${item.icon}</span>`;
        // فقط عکس آپلودی واقعی has-photo می‌گیره؛ ایموجی‌ها حباب و انیمیشن خودشون رو نگه می‌دارن
        const glyphPhotoClass = item.isImg ? 'has-photo' : '';
        return `
          <div class="avatar-select-item ${item.unlocked ? '' : 'locked'} ${extraClass}" data-tier="${item.type || ''}" onclick="${clickAction}">
            <span class="avatar-glyph ${glyphPhotoClass}">${glyphInner}</span>
            <span class="avatar-badge">${badgeText}</span>
          </div>
        `;
      }).join('');
    }

    function handleAvatarGridClick(idx) {
      const item = avatarGridItems[idx];
      if (!item || item.isPending) return;
      if (item.type === 'vip') { handleVipAvatarClick(); return; }
      if (item.unlocked) selectUserAvatar(item.icon);
      else checkAvatarCondition(item);
    }

    function selectUserAvatar(avatarVal) {
      if (!currentActiveUser) return;

      // در انتظار تایید عکس اختصاصی هم امکان تغییر آواتار وجود دارد؛ اگر بعداً عکس تایید شد،
      // جایگزین هر آواتاری که کاربر همین الان انتخاب کند خواهد شد (رفتار در پنل ادمین، فایل admin-users.js، پیاده‌سازی شده)
      currentActiveUser.avatar = avatarVal;

      const users = getUsersDatabase();
      const uIdx = users.findIndex(u => u.phone === currentActiveUser.phone);
      if (uIdx !== -1) {
        users[uIdx].avatar = avatarVal;
        saveUsersDatabase(users);
      }
      localStorage.setItem('pdf_market_active_session', JSON.stringify(currentActiveUser));

      alert(currentLang === 'fa' ? '✅ آواتار پروفایل شما با موفقیت به‌روزرسانی شد.' : '✅ Profile avatar updated successfully.');
      initUserAuthState();
      closeAvatarSelectModal(); // این خودش پنل کاربری رو دوباره باز می‌کنه، نیازی به فراخوانی دوباره نیست
    }

    // کلیک روی آیتم «آواتار اختصاصی»: بسته به وضعیت فعلی کاربر، شرایط را نشان می‌دهد یا دیالوگ انتخاب فایل را باز می‌کند
    function handleVipAvatarClick() {
      if (!currentActiveUser) return;
      const info = getVipItemState(currentActiveUser);
      const fa = currentLang === 'fa';

      if (info.state === 'locked') {
        alert(fa
          ? `🏆 آواتار اختصاصی و شخصی‌سازی‌شده (مخصوص برنده‌ی هر ماه)\n\nاین بخش قفل است. برای ورود به رقابت باید حداقل ۹ آواتار از لیست بالا را باز کنید (${info.unlockedCount} از ۹ باز شده).\n\nبعد از باز شدن، هر ماه با این ۴ کار امتیاز می‌گیرید (به ترتیب اولویت):\n۱. خرید کتاب\n۲. دعوت زیرمجموعه\n۳. دقایق مطالعه\n۴. دقایق حضور در سایت\n\nنفر اول رقابت هر ماه، در پایان همان ماه اعلام می‌شود و در ماه بعد (یک بازه‌ی حدود ۳۰ روزه) می‌تواند عکس شخصی‌سازی‌شده بگذارد.`
          : `🏆 Custom Personalized Avatar (for each month's winner)\n\nThis section is locked. To enter the contest you must unlock at least 9 avatars from the list above (${info.unlockedCount} of 9 unlocked).\n\nOnce unlocked, you earn points every month from these 4 activities (in priority order):\n1. Buying books\n2. Referrals\n3. Reading minutes\n4. Minutes on the site\n\nThe #1 user of each month is announced at the end of that month and can set a custom photo during the following month (about 30 days).`);
        return;
      }

      if (info.state === 'competing') {
        const sum = getStandingSummary(currentActiveUser);
        const curName = monthNameOf(sum.curKey, currentLang);
        const nextName = monthNameOf(sum.nextKey, currentLang);
        const N = n => fmtL(currentLang, n);
        const mineV = sum.mineD ? levelVals(sum.mineD) : [0, 0, 0, 0];
        let msg = fa
          ? `🎯 شما فعلاً برنده‌ی ${curName} نیستید و عکس اختصاصی ندارید.\n\nرقابت ${curName} تعیین می‌کند چه کسی در ${nextName} عکس اختصاصی بگذارد.\n\nامتیاز شما در ${curName}:\n${statsLine('fa', mineV)}`
          : `🎯 You are not the winner of ${curName}, so you have no custom photo.\n\nThe ${curName} contest decides who can set a custom photo in ${nextName}.\n\nYour points in ${curName}:\n${statsLine('en', mineV)}`;
        if (sum.leader) {
          const lv = levelVals(sum.leader.d);
          msg += fa
            ? `\n\nپیشتاز فعلی «${sum.leader.username}»:\n${statsLine('fa', lv)}`
            : `\n\nCurrent leader "${sum.leader.username}":\n${statsLine('en', lv)}`;
          if (sum.leader.phone !== currentActiveUser.phone) {
            const p = fastestPath(mineV, lv);
            if (p) msg += fa ? `\n\nسریع‌ترین راه برای اول شدن: ${pathText('fa', p)}.` : `\n\nFastest way to reach #1: ${pathText('en', p)}.`;
          } else {
            msg += fa ? `\n\n✅ شما پیشتاز رقابت هستید؛ اگر تا پایان ${curName} همین‌طور بمانید، برنده‌ی ${nextName} می‌شوید.` : `\n\n✅ You are leading; if it stays this way until the end of ${curName}, you win ${nextName}.`;
          }
        } else {
          msg += fa ? '\n\nتا این لحظه هیچ‌کس امتیازی نگرفته؛ با هر فعالیتی پیشتاز می‌شوید.' : '\n\nNobody has scored yet; any activity makes you the leader.';
        }
        msg += fa ? `\n\n⏳ ${N(sum.daysLeft)} روز تا پایان رقابت (امروز هم حساب می‌شود).` : `\n\n⏳ ${N(sum.daysLeft)} day(s) left (today included).`;
        alert(msg);
        return;
      }

      if (info.state === 'pending') {
        const submittedAt = new Date(currentActiveUser.pendingAvatarSubmittedAt);
        alert(fa
          ? `⏳ عکس شما در تاریخ ${submittedAt.toLocaleDateString('fa-IR')} ارسال شد و در انتظار بررسی مدیر است (حداکثر ۲ روز). تا مشخص شدن نتیجه می‌توانید از لیست بالا آواتار دیگری هم انتخاب کنید؛ به‌محض تایید، عکس شخصی‌سازی‌شده جایگزین آن می‌شود.`
          : `⏳ Your photo was submitted on ${submittedAt.toLocaleDateString('en-US')} and is pending admin review (up to 2 days). You can still pick a different avatar from the list meanwhile; once approved, your custom photo will take over automatically.`);
        return;
      }

      if (info.state === 'active') {
        const curName = monthNameOf(getCurrentMonthKey(), currentLang);
        const nextName = monthNameOf(getAdjacentMonthKey(+1), currentLang);
        alert(fa
          ? `🏆 شما برنده‌ی ${curName} هستید و عکس شخصی‌سازی‌شده‌تان تا پایان ${curName} فعال است. این عکس وسط ماه پاک نمی‌شود.\n\nبرای ${nextName} دوباره باید در رقابت‌ ${curName} اول شوید؛ یک روز مانده به پایان ماه، وضعیت رتبه‌ی شما را در «پیام از مدیریت» اعلام می‌کنیم.`
          : `🏆 You are the winner of ${curName} and your custom photo stays active until the end of ${curName}. It will not be removed mid-month.\n\nTo keep it for ${nextName} you must rank #1 in the ${curName} contest; one day before the month ends we will post your ranking status in "Message from Management".`);
        return;
      }

      // state === 'ready': کاربر برنده‌ی این ماه است و هنوز عکسی نگذاشته؛ روی دستگاه‌های دسکتاپ دیالوگ بومی انتخاب فایل باز می‌شود
      triggerVipFileDialog();
    }

    function triggerVipFileDialog() {
      const input = document.getElementById('vipAvatarFileInput');
      input.value = '';
      input.click();
    }

    let vipSelectedImageDataUrl = null;

    // فایل انتخاب‌شده را فقط اعتبارسنجی و پیش‌نمایش می‌کند؛ ارسال نهایی با دکمه‌ی «ادامه» در مودال پیش‌نمایش انجام می‌شود
    function handleVipAvatarFileChosen(event) {
      const file = event.target.files && event.target.files[0];
      if (!file) return;

      const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      const MAX_BYTES = 5 * 1024 * 1024;
      if (!ALLOWED_TYPES.includes(file.type)) {
        alert(currentLang === 'fa' ? '⛔ فقط تصاویر JPG، PNG، WEBP یا GIF مجاز است.' : '⛔ Only JPG, PNG, WEBP or GIF images are allowed.');
        return;
      }
      if (file.size > MAX_BYTES) {
        alert(currentLang === 'fa' ? '⛔ حجم تصویر نباید بیشتر از ۵ مگابایت باشد.' : '⛔ Image size must not exceed 5 MB.');
        return;
      }

      const reader = new FileReader();
      reader.onerror = function() {
        alert(currentLang === 'fa' ? '❌ خواندن فایل ناموفق بود.' : '❌ Could not read the file.');
      };
      reader.onload = function(e) {
        vipSelectedImageDataUrl = e.target.result;
        document.getElementById('vipAvatarPreviewImg').src = vipSelectedImageDataUrl;
        document.getElementById('avatarPreviewModal').style.display = 'flex';
      };
      reader.readAsDataURL(file);
    }

    function cancelVipAvatarPreview() {
      vipSelectedImageDataUrl = null;
      document.getElementById('avatarPreviewModal').style.display = 'none';
    }

    // دکمه‌ی «ادامه» در مودال پیش‌نمایش: عکس نهایی می‌شود و برای بررسی مدیر ارسال می‌شود
    function confirmVipAvatarUpload() {
      if (!currentActiveUser || !vipSelectedImageDataUrl) { cancelVipAvatarPreview(); return; }

      const img = new Image();
      img.onerror = function() {
        alert(currentLang === 'fa' ? '❌ این فایل یک تصویر معتبر نیست.' : '❌ This file is not a valid image.');
        cancelVipAvatarPreview();
      };
      img.onload = function() {
        // تصویر به مربع ۲۵۶×۲۵۶ کوچک و به JPEG بازنویسی می‌شود (هم حجم کم، هم حذف هر محتوای مخفی)
        const SIZE = 256;
        const side = Math.min(img.width, img.height);
        const canvas = document.createElement('canvas');
        canvas.width = SIZE;
        canvas.height = SIZE;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, SIZE, SIZE);
        ctx.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, SIZE, SIZE);
        const base64Img = canvas.toDataURL('image/jpeg', 0.85);

        // عکس فوراً به‌عنوان آواتار ثبت نمی‌شه؛ فقط در صف بررسی مدیر قرار می‌گیره
        // آواتار فعلی قبل از رفتن به حالت انتظار ذخیره می‌شه تا اگه عکس رد شد، بشه برگردوندش
        currentActiveUser.previousAvatar = currentActiveUser.avatar;
        currentActiveUser.pendingAvatarImage = base64Img;
        currentActiveUser.pendingAvatarSubmittedAt = Date.now();
        currentActiveUser.avatar = '⏳'; // آواتار موقت تا زمان تایید (کاربر می‌تواند بعداً از لیست آواتار دیگری انتخاب کند)

        const users = getUsersDatabase();
        const uIdx = users.findIndex(u => u.phone === currentActiveUser.phone);
        if (uIdx !== -1) {
          users[uIdx].previousAvatar = currentActiveUser.previousAvatar;
          users[uIdx].pendingAvatarImage = base64Img;
          users[uIdx].pendingAvatarSubmittedAt = currentActiveUser.pendingAvatarSubmittedAt;
          users[uIdx].avatar = '⏳';
          saveUsersDatabase(users);
        }
        localStorage.setItem('pdf_market_active_session', JSON.stringify(currentActiveUser));

        vipSelectedImageDataUrl = null;
        document.getElementById('avatarPreviewModal').style.display = 'none';

        alert(currentLang === 'fa'
          ? '📤 عکس شما ثبت شد و برای بررسی نزد مدیر ارسال گردید. تا حداکثر ۲ روز آینده نتیجه مشخص می‌شود. تا آن زمان یک آواتار موقت روی پروفایل شما نمایش داده می‌شود و همچنان می‌توانید از لیست آواتار دیگری انتخاب کنید.'
          : '📤 Your photo was submitted for admin review (up to 2 days at most). A temporary avatar shows on your profile until then, and you can still pick another avatar from the list meanwhile.');

        renderAvatarGrid();
        initUserAuthState();
      };
      img.src = vipSelectedImageDataUrl;
    }

    function openWalletTransactionsModal() {
      if (!currentActiveUser) return;
      closeUserPanelModal();
      document.getElementById('walletTransactionsModal').style.display = 'flex';
      setTxTypeFilter('all');
    }

    function closeWalletTransactionsModal() {
      document.getElementById('walletTransactionsModal').style.display = 'none';
      openUserPanelModal();
    }

    function setTxTypeFilter(type) {
      activeTxType = type;
      ['filterTxAll', 'filterTxDeposit', 'filterTxWithdraw'].forEach(id => {
        const b = document.getElementById(id);
        if (b) b.classList.remove('active');
      });
      const activeBtn = document.getElementById(type === 'deposit' ? 'filterTxDeposit' : type === 'withdraw' ? 'filterTxWithdraw' : 'filterTxAll');
      if (activeBtn) activeBtn.classList.add('active');
      const txSel = document.getElementById('txTypeSelect');
      if (txSel) txSel.value = type;

      renderAdvancedTransactions();
    }

    function renderAdvancedTransactions() {
      const container = document.getElementById('advancedTransactionsListContainer');
      const reportTitle = document.getElementById('txSummaryReportTitle');
      if (!currentActiveUser) return;

      if (!currentActiveUser.transactions) {
        const ONE_DAY_MS = 24 * 60 * 60 * 1000;
        currentActiveUser.transactions = [
          { date: new Date(Date.now() - (2 * ONE_DAY_MS)).toLocaleDateString('fa-IR'), timestamp: Date.now() - (2 * ONE_DAY_MS), type: 'deposit', amount: 50000, desc: currentLang === 'fa' ? 'پورسانت زیرمجموعه لایه ۱' : 'Tier 1 Referral Commission', descFa: 'پورسانت زیرمجموعه لایه ۱', descEn: 'Tier 1 Referral Commission', status: currentLang === 'fa' ? 'موفق' : 'Successful', statusFa: 'موفق', statusEn: 'Successful' },
          { date: new Date(Date.now() - (45 * ONE_DAY_MS)).toLocaleDateString('fa-IR'), timestamp: Date.now() - (45 * ONE_DAY_MS), type: 'withdraw', amount: 200000, desc: currentLang === 'fa' ? 'برداشت نقدی به شبا' : 'Sheba Bank Withdrawal', descFa: 'برداشت نقدی به شبا', descEn: 'Sheba Bank Withdrawal', status: currentLang === 'fa' ? 'موفق' : 'Successful', statusFa: 'موفق', statusEn: 'Successful' }
        ];
        // تراکنش‌ها روی دیتابیس هم ذخیره بشن، نه فقط روی نشست فعلی، تا با خروج/ورود از بین نرن
        const usersDb = getUsersDatabase();
        const dbIdx = usersDb.findIndex(u => u.phone === currentActiveUser.phone);
        if (dbIdx !== -1) {
          usersDb[dbIdx].transactions = currentActiveUser.transactions;
          saveUsersDatabase(usersDb);
          localStorage.setItem('pdf_market_active_session', JSON.stringify(currentActiveUser));
        }
      }

      const period = document.getElementById('txTimePeriodSelect').value;
      const now = Date.now();
      const ONE_DAY_MS = 24 * 60 * 60 * 1000;
      const periodCutoff = period === 'day' ? now - ONE_DAY_MS :
                            period === 'month' ? now - (30 * ONE_DAY_MS) :
                            period === 'year' ? now - (365 * ONE_DAY_MS) :
                            0; // 'all' یا مقدار نامشخص یعنی بدون محدودیت

      const txs = currentActiveUser.transactions.filter(tx => {
        if (activeTxType !== 'all' && tx.type !== activeTxType) return false;
        if (periodCutoff && (tx.timestamp || 0) < periodCutoff) return false;
        return true;
      });

      const sumAmount = txs.reduce((acc, t) => acc + (t.type === 'deposit' ? t.amount : -t.amount), 0);
      const last10Txs = txs.slice(-10).reverse();

      const periodNameText = period === 'day' ? (currentLang === 'fa' ? 'روز جاری' : 'Today') :
                             period === 'month' ? (currentLang === 'fa' ? 'یک ماه اخیر' : 'Last Month') :
                             period === 'year' ? (currentLang === 'fa' ? 'یک سال اخیر' : 'Last Year') :
                             (currentLang === 'fa' ? 'کل زمان‌ها' : 'All Time');

      const typeNameText = activeTxType === 'deposit' ? (currentLang === 'fa' ? 'واریزی‌ها' : 'Deposits') :
                           activeTxType === 'withdraw' ? (currentLang === 'fa' ? 'برداشت‌ها' : 'Withdrawals') :
                           (currentLang === 'fa' ? 'همه تراکنش‌ها' : 'All Transactions');

      reportTitle.textContent = `${typeNameText} (${periodNameText}) - ${currentLang === 'fa' ? 'خالص' : 'Net'}: ${sumAmount.toLocaleString()} ${currentLang === 'fa' ? 'تومان' : 'Toman'}`;

      if (last10Txs.length === 0) {
        container.innerHTML = `<div class="transaction-card-item"><span style="color:var(--text-muted);">${currentLang === 'fa' ? 'تراکنشی در این بازه یافت نشد' : 'No transactions found in this period'}</span></div>`;
        return;
      }

      container.innerHTML = last10Txs.map(tx => {
        // متن، وضعیت و تاریخ تراکنش بر اساس زبان فعلی نمایش داده می‌شود (تراکنش‌های قدیمی بدون متن دوزبانه همان desc/status را نشان می‌دهند)
        const txDesc = (currentLang === 'fa' ? tx.descFa : tx.descEn) || tx.desc || '';
        const txStatus = (currentLang === 'fa' ? tx.statusFa : tx.statusEn) || tx.status || '';
        const txDate = tx.timestamp ? new Date(tx.timestamp).toLocaleDateString(currentLang === 'fa' ? 'fa-IR' : 'en-US') : tx.date;
        const isDep = tx.type === 'deposit';
        const iconSymbol = isDep ? '📥' : '📤';
        const badgeClass = isDep ? 'deposit' : 'withdraw';
        const typeColor = isDep ? '#27ae60' : 'var(--primary)';
        const typeSign = isDep ? '+' : '-';

        return `
          <div class="transaction-card-item">
            <div style="display:flex; align-items:center; gap:10px;">
              <div class="tx-icon-badge ${badgeClass}">${iconSymbol}</div>
              <div>
                <strong style="color:var(--text); font-size:0.86rem; display:block;">${escapeHtml(txDesc)}</strong>
                <span style="font-size:0.75rem; color:var(--text-muted);">${txDate}</span>
              </div>
            </div>
            <div style="text-align: left;">
              <strong style="color:${typeColor}; font-size:0.92rem; display:block;">${typeSign} ${tx.amount.toLocaleString()} ${currentLang === 'fa' ? 'تومان' : 'Toman'}</strong>
              <span style="font-size:0.72rem; color:#27ae60; font-weight:700;">${escapeHtml(txStatus)}</span>
            </div>
          </div>
        `;
      }).join('');
    }

    function renderReadingHistoryChart() {
      const container = document.getElementById('readingHistoryChartBox');
      if (!currentActiveUser) return;
      const dateLocale = currentLang === 'fa' ? 'fa-IR' : 'en-US';
      // تاریخ نمایشی همیشه از dayKey و به زبان فعلی ساخته می‌شود تا با تغییر زبان به‌هم نریزد
      const logs = (currentActiveUser.readingLogs || []).map(l => ({ ...l, date: l.dayKey ? formatDayKey(l.dayKey, dateLocale) : l.date }));
      const unit = document.getElementById('readingTimeUnitSelect').value;
      const searchDate = document.getElementById('readingDateSpecificInput').value.trim();

      let filteredLogs = logs;
      if (searchDate) {
        // صفرهای اولِ هر بخش تاریخ نادیده گرفته می‌شود (۰۶ = ۶)
        const cleanDate = (d) => normalizeDigits(d).replace(/(^|\/)0+(?=\d)/g, '$1');
        const needle = cleanDate(searchDate);
        filteredLogs = logs.filter(l => cleanDate(l.date).includes(needle));
      }

      if (filteredLogs.length === 0) {
        const emptyLog = currentLang === 'fa'
          ? 'موردی برای تاریخ انتخاب‌شده یافت نشد.'
          : 'No reading records found for the selected date.';
        container.innerHTML = `<div style="font-size:0.85rem; color:var(--text-muted); padding:20px; width:100%; text-align:center;">${emptyLog}</div>`;
        return;
      }

      const maxVal = Math.max(...filteredLogs.map(l => unit === 'hours' ? l.minutes / 60 : l.minutes), 1);

      container.innerHTML = filteredLogs.map(item => {
        const rawVal = unit === 'hours' ? item.minutes / 60 : item.minutes;
        const displayVal = unit === 'hours' ? rawVal.toFixed(1) : rawVal;
        const heightPercent = Math.max((rawVal / maxVal) * 100, 12);

        return `
          <div class="chart-bar-column">
            <span class="chart-bar-value">${displayVal}</span>
            <div class="chart-bar-fill" style="height: ${heightPercent}%;" title="${item.date}: ${displayVal}"></div>
            <span class="chart-bar-label">${item.date}</span>
          </div>
        `;
      }).join('');
    }

    function openReferralHelpModal() {
      closeUserPanelModal();
      document.getElementById('referralHelpModal').style.display = 'flex';
    }

    function closeReferralHelpModal() {
      document.getElementById('referralHelpModal').style.display = 'none';
      openUserPanelModal();
    }

    function openPhoneVerifyModal() {
      if (!currentActiveUser) return;
      closeUserPanelModal();
      document.getElementById('phoneVerifyModal').style.display = 'flex';
      document.getElementById('phoneVerifyDisplayInput').value = (currentLang === 'fa' ? 'شماره شما: ' : 'Your Phone: ') + currentActiveUser.phone;
      document.getElementById('phoneVerifySendForm').style.display = 'flex';
      document.getElementById('phoneVerifyConfirmForm').style.display = 'none';
      document.getElementById('simulatedPhoneVerifySmsBanner').style.display = 'none';
    }

    function closePhoneVerifyModal() {
      document.getElementById('phoneVerifyModal').style.display = 'none';
      openUserPanelModal();
    }

    function handleSendPhoneVerifyOtp(e) {
      e.preventDefault();
      const otp = Math.floor(1000 + Math.random() * 9000).toString();
      pendingPhoneVerifyData = { otp };

      const banner = document.getElementById('simulatedPhoneVerifySmsBanner');
      banner.style.display = 'block';
      banner.innerHTML = `📲 <strong>SMS OTP:</strong> Code: <span style="font-size:1.25rem; font-weight:800; color:#d32f2f;">${otp}</span>`;

      document.getElementById('phoneVerifySendForm').style.display = 'none';
      document.getElementById('phoneVerifyConfirmForm').style.display = 'flex';
    }

    function handleConfirmPhoneVerifyOtp(e) {
      e.preventDefault();
      const enteredCode = normalizeDigits(document.getElementById('phoneVerifyOtpInput').value.trim());

      if (pendingPhoneVerifyData && enteredCode === pendingPhoneVerifyData.otp) {
        const users = getUsersDatabase();
        const uIdx = users.findIndex(u => u.phone === currentActiveUser.phone);
        if (uIdx !== -1) {
          users[uIdx].phoneVerified = true;
          saveUsersDatabase(users);

          currentActiveUser.phoneVerified = true;
          localStorage.setItem('pdf_market_active_session', JSON.stringify(currentActiveUser));

          alert(currentLang === 'fa' 
            ? '✅ شماره همراه شما با موفقیت تأیید شد! امکان برداشت نقدی از کیف پول برای شما فعال گردید.'
            : '✅ Your phone number has been verified successfully! Cash withdrawal is now unlocked for your account.');

          document.getElementById('phoneVerifyModal').style.display = 'none';
          initUserAuthState();
          openUserPanelModal();
        }
      } else {
        alert(currentLang === 'fa' ? '❌ کد پیامک وارد شده اشتباه است!' : '❌ Incorrect verification code!');
      }
    }

    function triggerUsernameChangeFlow() {
      if (!currentActiveUser) return;
      const lastChange = currentActiveUser.lastUsernameChangeTimestamp || 0;
      const now = Date.now();
      const hoursPassed = (now - lastChange) / (1000 * 60 * 60);

      if (hoursPassed < 24) {
        const remainingHours = Math.ceil(24 - hoursPassed);
        const msg = currentLang === 'fa' 
          ? `شما هر ۲۴ ساعت فقط یک بار می‌توانید نام کاربری خود را تغییر دهید. لطفاً ${remainingHours} ساعت دیگر تلاش فرمایید.`
          : `You can only change your username once every 24 hours. Please wait ${remainingHours} more hours.`;
        alert(msg);
        return;
      }

      const confirmQuestion = currentLang === 'fa' 
        ? 'آیا مایل به تغییر نام کاربری خود هستید؟ این کار نیازمند تأیید شماره همراه شما با پیامک است.'
        : 'Do you want to change your username? This requires SMS verification to your registered phone.';
      
      if (confirm(confirmQuestion)) {
        closeUserPanelModal();
        openChangeUsernameModal();
      }
    }

    function openChangeUsernameModal() {
      document.getElementById('changeUsernameModal').style.display = 'flex';
      document.getElementById('changeUserPhoneInput').value = currentActiveUser.phone;
      document.getElementById('changeUserPhoneForm').style.display = 'flex';
      document.getElementById('changeUserOtpForm').style.display = 'none';
      document.getElementById('changeUserFinalForm').style.display = 'none';
      document.getElementById('simulatedUserChangeSmsBanner').style.display = 'none';
    }

    function closeChangeUsernameModal() {
      document.getElementById('changeUsernameModal').style.display = 'none';
      openUserPanelModal();
    }

    function handleSendChangeUserOtp(e) {
      e.preventDefault();
      const otp = Math.floor(1000 + Math.random() * 9000).toString();
      pendingChangeUserData = { otp };

      const banner = document.getElementById('simulatedUserChangeSmsBanner');
      banner.style.display = 'block';
      banner.innerHTML = `📲 <strong>SMS OTP:</strong> Code: <span style="font-size:1.2rem; font-weight:800; color:#d32f2f;">${otp}</span>`;

      document.getElementById('changeUserPhoneForm').style.display = 'none';
      document.getElementById('changeUserOtpForm').style.display = 'flex';
    }

    function handleVerifyChangeUserOtp(e) {
      e.preventDefault();
      const code = normalizeDigits(document.getElementById('changeUserOtpInput').value.trim());
      if (pendingChangeUserData && code === pendingChangeUserData.otp) {
        document.getElementById('simulatedUserChangeSmsBanner').style.display = 'none';
        document.getElementById('changeUserOtpForm').style.display = 'none';
        document.getElementById('changeUserFinalForm').style.display = 'flex';
      } else {
        alert(currentLang === 'fa' ? '❌ کد پیامکی اشتباه است!' : '❌ Incorrect verification code!');
      }
    }

    function handleFinalizeNewUsername(e) {
      e.preventDefault();
      const newName = document.getElementById('changeUserNewUsernameInput').value.trim().toLowerCase();
      if (!newName) return;
      if (!isValidUsername(newName)) {
        alert(usernameErrorMsg());
        return;
      }

      const users = getUsersDatabase();
      if (users.some(u => u.username.toLowerCase() === newName && u.phone !== currentActiveUser.phone)) {
        alert(currentLang === 'fa' ? '⚠️ این نام کاربری قبلاً انتخاب شده است.' : '⚠️ This username is already taken.');
        return;
      }

      const uIdx = users.findIndex(u => u.phone === currentActiveUser.phone);
      if (uIdx !== -1) {
        users[uIdx].username = newName;
        users[uIdx].lastUsernameChangeTimestamp = Date.now();
        // نکته: نام کاربری تغییر می‌کنه، ولی کدهای تخفیف موجود (استفاده‌شده یا نشده) دست‌نخورده می‌مونن
        saveUsersDatabase(users);

        currentActiveUser = users[uIdx];
        localStorage.setItem('pdf_market_active_session', JSON.stringify(currentActiveUser));

        alert(currentLang === 'fa' ? '✅ نام کاربری با موفقیت تغییر یافت.' : '✅ Username changed successfully.');
        document.getElementById('changeUsernameModal').style.display = 'none';
        initUserAuthState();
        openUserPanelModal();
      }
    }

    function renderUserVouchers() {
      const container = document.getElementById('panelVouchersListContainer');
      if (!currentActiveUser || !currentActiveUser.userVouchers) return;
      const copyLabel = currentLang === 'fa' ? 'کپی' : 'Copy';

      container.innerHTML = currentActiveUser.userVouchers.map(v => `
        <div class="voucher-chip">
          <span>${escapeHtml(currentLang === 'fa' ? v.labelFa : v.labelEn)} <strong>${escapeHtml(v.code)}</strong></span>
          <button class="btn-copy-code" data-code="${escapeHtml(v.code)}" onclick="copyToClipboard(this.dataset.code, this)">${copyLabel}</button>
        </div>
      `).join('');
    }

    function filterUserShelfBySelect(status) {
      activeShelfFilter = status;
      renderUserShelf();
    }

    function renderUserShelf() {
      const container = document.getElementById('panelPurchasedBooksList');
      if (!currentActiveUser) return;
      warmReader();
      scheduleUserSync(2000);

      const booksList = (currentActiveUser.purchasedBooks || []).map(pb => {
        const bk = books.find(x => x.id === pb.id);
        return bk ? { ...pb, title: bk.title[currentLang], author: bk.author[currentLang] } : pb;
      });
      const searchQ = document.getElementById('shelfSearchInput').value.trim().toLowerCase();

      if (booksList.length === 0) {
        const emptyMsg = currentLang === 'fa'
          ? 'هنوز کتابی خریداری نکرده‌اید؛ تمامی کتاب‌های PDF پس از خرید برای همیشه اینجا ذخیره می‌شوند.'
          : 'You have not purchased any books yet. Purchased PDF books will be permanently stored here.';
        container.innerHTML = `<div style="font-size:0.85rem; color:var(--text-muted); padding:8px 0;">${emptyMsg}</div>`;
        return;
      }

      const filtered = booksList.filter(b => {
        if (activeShelfFilter !== 'all' && b.status !== activeShelfFilter) return false;
        if (searchQ && !b.title.toLowerCase().includes(searchQ) && !b.author.toLowerCase().includes(searchQ)) return false;
        return true;
      });

      if (filtered.length === 0) {
        const noMatchMsg = currentLang === 'fa' ? 'کتابی با این مشخصات در قفسه شما یافت نشد.' : 'No matching books found in your shelf.';
        container.innerHTML = `<div style="font-size:0.82rem; color:var(--text-muted); padding:6px 0;">${noMatchMsg}</div>`;
        return;
      }

      const fa = currentLang === 'fa';
      const nf = n => fa ? Number(n).toLocaleString('fa-IR') : String(n);
      const optUnread = fa ? '⏳ خوانده‌نشده' : '⏳ Unread';
      const optReading = fa ? '📖 در حال خواندن' : '📖 Reading';
      const optFinished = fa ? '✅ خوانده‌شده' : '✅ Finished';
      const btnReadLabel = fa ? 'مطالعه' : 'Read';
      const btnContinueLabel = fa ? 'ادامه مطالعه' : 'Continue';
      const btnDeleteLabel = fa ? '🗑️ حذف' : '🗑️ Remove';

      const catalogProgressInfo = id => {
        const bk = books.find(x => x.id === id);
        const n = bk ? Number(bk.pages) : 0;
        return n > 0 ? { page: 0, total: n, pct: 0, ts: 0 } : null;
      };
      const rows = filtered.map(b => ({ b: b, info: bookProgressInfo(b.id) || catalogProgressInfo(b.id) }));
      rows.sort((x, y) => ((y.info ? y.info.ts : 0) - (x.info ? x.info.ts : 0)) || ((y.b.ts || 0) - (x.b.ts || 0)));

      const barHtml = info => ` <div style="display:inline-flex; align-items:center; gap:8px; margin-top:7px; padding:3px 4px 3px 10px; border-radius:999px; background:var(--card-bg); border:1px solid var(--border); font-size:0.74rem; color:var(--text-muted); line-height:1.6;"> <span>📖</span> <span><b style="color:var(--text);">${nf(info.page)}</b> ${fa ? 'از' : 'of'} ${nf(info.total)} ${fa ? 'صفحه خوانده شده' : 'pages read'}</span> <span style="background:var(--primary); color:#fff; font-weight:bold; border-radius:999px; padding:1px 9px;">${nf(info.pct)}${fa ? '٪' : '%'}</span> </div>`;

      let continueHtml = '';
      if (activeShelfFilter === 'all' && !searchQ) {
        const cand = rows.find(x => x.info && x.info.page > 1 && x.info.pct < 95 && x.b.status !== 'finished');
        if (cand) {
          continueHtml = ` <div style="background:var(--menu-bg); border:1px solid var(--primary); border-radius:10px; padding:12px 14px; margin-bottom:10px;"> <div style="font-size:0.78rem; color:var(--primary); font-weight:bold; margin-bottom:4px;">${fa ? '📖 ادامه‌ی مطالعه' : '📖 Continue reading'}</div> <div style="display:flex; justify-content:space-between; align-items:center; gap:10px; flex-wrap:wrap;"> <div style="flex:1; min-width:160px;"><strong>${cand.b.title}</strong>${barHtml(cand.info)}</div> <button class="btn-read" style="padding:8px 16px;" onclick="openReader('${cand.b.id}')">${btnContinueLabel}</button> </div> </div>`;
        }
      }

      container.innerHTML = continueHtml + rows.map(({ b, info }) => ` <div style="background:var(--menu-bg); border:1px solid var(--border); border-radius:8px; padding:8px 12px; margin-bottom:6px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px;"> <div style="flex:1; min-width:150px;"> <strong>${b.title}</strong> <span style="font-size:0.75rem; color:var(--text-muted); margin-right:8px; margin-left:8px;">(${b.author})</span> ${info ? barHtml(info) : ''} </div> <div style="display:flex; gap:6px; align-items:center;"> <select onchange="updateBookReadStatus('${b.id}', this.value)" style="background:var(--card-bg); border:1px solid var(--border); border-radius:5px; padding:2px 6px; font-size:0.75rem; font-family:inherit; color:var(--text);"> <option value="unread" ${b.status === 'unread' ? 'selected' : ''}>${optUnread}</option> <option value="reading" ${b.status === 'reading' ? 'selected' : ''}>${optReading}</option> <option value="finished" ${b.status === 'finished' ? 'selected' : ''}>${optFinished}</option> </select> <button class="btn-copy-code" style="padding:4px 8px;" onclick="openReader('${b.id}')">${info && info.page > 1 && info.pct < 95 ? btnContinueLabel : btnReadLabel}</button> <button class="btn-tool" style="padding:4px 8px; font-size:0.72rem; color:var(--primary); border-color:var(--primary);" onclick="removeBookFromShelf('${b.id}')">${btnDeleteLabel}</button> </div> </div> `).join('');
    }

    function removeBookFromShelf(bookId) {
      if (!currentActiveUser) return;
      const confirmDel = currentLang === 'fa' ? 'آیا مایلید این کتاب را از قفسه خود حذف کنید؟' : 'Do you want to remove this book from your shelf?';
      if (confirm(confirmDel)) {
        currentActiveUser.purchasedBooks = currentActiveUser.purchasedBooks.filter(b => b.id !== bookId);
        const users = getUsersDatabase();
        const uIdx = users.findIndex(u => u.phone === currentActiveUser.phone);
        if (uIdx !== -1) {
          users[uIdx].purchasedBooks = currentActiveUser.purchasedBooks;
          saveUsersDatabase(users);
        }
        localStorage.setItem('pdf_market_active_session', JSON.stringify(currentActiveUser));
        renderUserShelf();
      }
    }

    function updateBookReadStatus(bookId, newStatus) {
      if (!currentActiveUser) return;
      const users = getUsersDatabase();
      const uIdx = users.findIndex(u => u.phone === currentActiveUser.phone);
      if (uIdx !== -1) {
        const b = users[uIdx].purchasedBooks.find(item => item.id === bookId);
        if (b) {
          b.status = newStatus;
          saveUsersDatabase(users);
          currentActiveUser = users[uIdx];
          localStorage.setItem('pdf_market_active_session', JSON.stringify(currentActiveUser));
          renderUserShelf();
        }
      }
    }

    function openAuthModal(defaultTab = 'login') {
      document.getElementById('authModal').style.display = 'flex';
      switchAuthTab(defaultTab);
      updateAuthCheckoutHint();
    }

    function closeAuthModal() {
      document.getElementById('authModal').style.display = 'none';
      resetAuthForms();
      pendingCheckoutAfterAuth = false;
      updateAuthCheckoutHint();
    }

    // بعد از ورود/ثبت‌نام: اگر کاربر از داخل سبد خرید آمده بود به همان سبد برمی‌گردد، وگرنه پنل شخصی باز می‌شود
    function updateAuthCheckoutHint() {
      const el = document.getElementById('authCheckoutHint');
      if (!el) return;
      el.style.display = pendingCheckoutAfterAuth ? 'block' : 'none';
      el.textContent = currentLang === 'fa'
        ? 'برای نهایی‌کردن خرید، وارد حساب خود شوید یا ثبت‌نام کنید. سبد خریدتان حفظ می‌شود.'
        : 'Sign in or create an account to finish your purchase. Your cart is saved.';
    }

    function finishAuthSuccess() {
      const resumeCheckout = pendingCheckoutAfterAuth;
      closeAuthModal();
      initUserAuthState();
      if (resumeCheckout) { openCartModal(); } else { openUserPanelModal(); }
    }


    function resetAuthForms() {
      document.getElementById('loginForm').reset();
      document.getElementById('regStep1Form').reset();
      document.getElementById('regStep2Form').reset();
      document.getElementById('regStep1Form').style.display = 'flex';
      document.getElementById('regStep2Form').style.display = 'none';
      document.getElementById('forgotStep1Form').reset();
      document.getElementById('forgotStep2Form').reset();
      pendingRegData = null;
    }

    function switchAuthTab(tab) {
      const tabLoginBtn = document.getElementById('tabLoginBtn');
      const tabRegisterBtn = document.getElementById('tabRegisterBtn');
      const loginForm = document.getElementById('loginForm');
      const registerFlow = document.getElementById('registerFlow');
      const forgotFlow = document.getElementById('forgotFlow');

      forgotFlow.style.display = 'none';

      if (tab === 'login') {
        tabLoginBtn.classList.add('active');
        tabRegisterBtn.classList.remove('active');
        document.getElementById('authTabHeader').style.display = 'flex';
        document.getElementById('authModalHeaderTitle').textContent = currentLang === 'fa' ? 'ورود به حساب کاربری' : 'Account Login';
        loginForm.style.display = 'flex';
        registerFlow.style.display = 'none';
      } else if (tab === 'register') {
        tabRegisterBtn.classList.add('active');
        tabLoginBtn.classList.remove('active');
        document.getElementById('authTabHeader').style.display = 'flex';
        document.getElementById('authModalHeaderTitle').textContent = currentLang === 'fa' ? 'ثبت‌نام در سایت' : 'Register Account';
        loginForm.style.display = 'none';
        registerFlow.style.display = 'block';

        document.getElementById('regStep1Form').style.display = 'flex';
        document.getElementById('regStep2Form').style.display = 'none';
      }
    }

    async function handleUserPasswordLogin(e) {
      e.preventDefault();
      const loginId = document.getElementById('loginUsername').value.trim().toLowerCase();
      const loginPhoneId = normalizeDigits(loginId);
      const pass = normalizeDigits(document.getElementById('loginPassword').value.trim());
      const isPhoneFormat = /^09[0-9]{9}$/.test(loginPhoneId);

      // مرحله‌ی اول فقط پیدا کردن «شماره»ی مربوط به این ورودی است (چه کاربر
      // شماره وارد کرده باشه چه نام کاربری)؛ رمز اینجا اصلاً چک نمی‌شه —
      // چک واقعیِ رمز رو خودِ Supabase Auth (پایین‌تر) انجام می‌ده.
      let phone = isPhoneFormat ? loginPhoneId : null;
      if (!phone) {
        const users = getUsersDatabase();
        const localMatch = users.find(u => u.username.toLowerCase() === loginId);
        phone = localMatch ? localMatch.phone : null;
      }
      if (!phone) {
        const remoteMatch = await supaFindUser({ username: loginId });
        phone = remoteMatch ? remoteMatch.phone : null;
      }

      if (!phone) {
        alert(currentLang === 'fa' ? '❌ نام کاربری یا رمز عبور اشتباه است!' : '❌ Invalid username or password!');
        return;
      }

      if (!supabaseClient) {
        alert(currentLang === 'fa' ? '❌ اتصال به سرور ورود برقرار نشد. لطفاً دوباره تلاش کنید.' : '❌ Could not reach the login server. Please try again.');
        return;
      }

      // چک واقعیِ رمز: کاملاً سمت سرورِ Supabase انجام می‌شه؛ رمز هیچ‌وقت
      // با چیزی توی localStorage یا جدول users مقایسه نمی‌شه.
      const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
        email: phoneToAuthEmail(phone),
        password: pass
      });

      if (authError || !authData || !authData.user) {
        alert(currentLang === 'fa' ? '❌ نام کاربری یا رمز عبور اشتباه است!' : '❌ Invalid username or password!');
        return;
      }

      let user = await supaFindUser({ phone });
      if (!user) {
        // رمز درست بود ولی پروفایل توی جدول نیست (ثبت‌نام قبلاً نصفه مانده) → خودکار ترمیم می‌کنیم
        const repaired = await supaRepairProfile(authData.user, phone);
        if (repaired) user = (await supaFindUser({ phone })) || repaired;
      }
      if (!user) {
        // پروفایل توی جدول users پیدا نشد ولی احراز هویت موفق بود؛ حالت غیرمنتظره
        alert(currentLang === 'fa' ? '❌ مشکلی در بارگذاری حساب شما پیش آمد. با پشتیبانی تماس بگیرید.' : '❌ Something went wrong loading your account. Please contact support.');
        return;
      }
      user = mergeRemoteUserIntoLocal(user);

      localStorage.setItem('pdf_market_active_session', JSON.stringify(user));
      // زبان ذخیره‌شده حساب کاربری بعد از ورود اعمال می‌شود (اگر با زبان فعلی صفحه فرق داشت)
      if (user.preferredLang && user.preferredLang !== currentLang && !window.PAGE_LANG) {
        toggleLanguage();
      }
      finishAuthSuccess();
    }

    async function handleRegisterStep1(e) {
      e.preventDefault();
      const username = document.getElementById('regUsername').value.trim().toLowerCase();
      const phone = normalizeDigits(document.getElementById('regPhone').value.trim());
      const password = normalizeDigits(document.getElementById('regPassword').value.trim());

      if (!isValidUsername(username)) {
        alert(usernameErrorMsg());
        return;
      }

      if (!phone.match(/^09[0-9]{9}$/)) {
        alert(currentLang === 'fa' ? 'لطفاً شماره همراه ۱۱ رقمی معتبر وارد کنید (مانند: 09123456789)' : 'Please enter an 11-digit mobile number (e.g. 09123456789)');
        return;
      }

      // رمز عبور فقط باید عدد باشه (مثل شماره تلفن)؛ چون فیلد ورودی هم زنده فیلتر می‌شه، این فقط یه لایه‌ی اطمینان اضافه‌ست
      if (!/^[0-9]+$/.test(password)) {
        alert(currentLang === 'fa' ? '⚠️ رمز عبور فقط می‌تواند شامل عدد باشد.' : '⚠️ Password can only contain digits.');
        return;
      }
      if (password.length < 6) {
        alert(currentLang === 'fa' ? '⚠️ رمز عبور باید حداقل ۶ رقم باشد.' : '⚠️ Password must be at least 6 digits.');
        return;
      }

      const users = getUsersDatabase();
      if (users.some(u => u.phone === phone)) {
        alert(currentLang === 'fa' ? '⚠️ این شماره همراه قبلاً ثبت شده است! هر شماره فقط یک بار امکان ثبت‌نام دارد.' : '⚠️ This mobile number is already registered! Each number can only register once.');
        switchAuthTab('login');
        return;
      }

      if (users.some(u => u.username.toLowerCase() === username)) {
        alert(currentLang === 'fa' ? '⚠️ این نام کاربری قبلاً انتخاب شده است.' : '⚠️ This username is already taken.');
        return;
      }

      // چک یکتا بودن شماره/نام‌کاربری در سطح کل سایت (روی دستگاه‌های دیگر هم)
      const remoteDuplicate = await supaFindUser({ phone, username });
      if (remoteDuplicate) {
        if (remoteDuplicate.phone === phone) {
          alert(currentLang === 'fa' ? '⚠️ این شماره همراه قبلاً ثبت شده است! هر شماره فقط یک بار امکان ثبت‌نام دارد.' : '⚠️ This mobile number is already registered! Each number can only register once.');
          switchAuthTab('login');
        } else {
          alert(currentLang === 'fa' ? '⚠️ این نام کاربری قبلاً انتخاب شده است.' : '⚠️ This username is already taken.');
        }
        return;
      }

      // فقط اگر کد معرفِ لینک واقعاً وجود داشته باشد مرحله‌ی وارد کردن دستی رد می‌شود
      const rawRef = sessionStorage.getItem('pdf_market_active_ref') || new URLSearchParams(window.location.search).get('ref');
      let validRefUser = rawRef ? users.find(u => u.referralCode && u.referralCode.toUpperCase() === rawRef.toUpperCase()) : null;
      if (!validRefUser && rawRef) {
        validRefUser = await supaFindUserByReferralCode(rawRef);
      }

      if (validRefUser) {
        await completeFinalRegistration(username, phone, password, validRefUser.referralCode);
      } else {
        pendingRegData = { username, phone, password };
        document.getElementById('regStep1Form').style.display = 'none';
        document.getElementById('regStep2Form').style.display = 'flex';
      }
    }

    async function handleRegisterStep2(e) {
      e.preventDefault();
      if (!pendingRegData) return;
      const enteredRef = document.getElementById('regReferralCodeInput').value.trim();

      // کادر خالی = کاربر معرف ندارد؛ مثل قبل ادامه می‌دهیم
      if (!enteredRef) {
        await completeFinalRegistration(pendingRegData.username, pendingRegData.phone, pendingRegData.password, '');
        return;
      }

      // کد نوشته شده: قبل از تکمیل ثبت‌نام باید واقعاً وجود داشته باشد تا پیوند معرف بی‌صدا نسوزد
      let uplineUser = getUsersDatabase().find(u => u.referralCode && u.referralCode.toUpperCase() === enteredRef.toUpperCase());
      if (!uplineUser) {
        uplineUser = await supaFindUserByReferralCode(enteredRef);
      }
      if (!uplineUser) {
        alert(currentLang === 'fa'
          ? '❌ کد معرف وارد شده نامعتبر است! لطفاً آن را اصلاح کنید یا در صورت نداشتن معرف، کادر را خالی بگذارید.'
          : '❌ The referral code entered is invalid! Please correct it or leave it empty if you do not have a referral code.');
        return;
      }

      // پیش از تکمیل ثبت‌نام، معرف پیدا‌شده را به کاربر نشان می‌دهیم و تأیید صریح او را می‌گیریم؛
      // با زدن «لغو» ثبت‌نام انجام نمی‌شود و کاربر می‌تواند کد را اصلاح یا کادر را خالی کند.
      const confirmRefMsg = currentLang === 'fa'
        ? `✅ این کد متعلق به کاربر «${uplineUser.username}» است. آیا معرف بودن این کاربر را تأیید می‌کنید؟`
        : `✅ This code belongs to user "${uplineUser.username}". Do you confirm them as your referrer?`;
      if (!confirm(confirmRefMsg)) return;

      await completeFinalRegistration(pendingRegData.username, pendingRegData.phone, pendingRegData.password, uplineUser.referralCode);
    }

    async function completeFinalRegistration(username, phone, password, referralCodeToLink) {
      if (!supabaseClient) {
        alert(currentLang === 'fa' ? '❌ اتصال به سرور ثبت‌نام برقرار نشد. لطفاً دوباره تلاش کنید.' : '❌ Could not reach the registration server. Please try again.');
        return;
      }

      // خودِ ساخت حساب (و هش کردن/نگهداری امن رمز) کاملاً سمت Supabase Auth
      // انجام می‌شه؛ رمز خام هیچ‌وقت به جدول users فرستاده یا توی
      // localStorage ذخیره نمی‌شه.
      // کد معرفِ این کاربر از همین‌جا ساخته می‌شه تا هم توی حساب ورود (برای ترمیم) و هم توی پروفایل یکی باشه
      const refCode = 'REF-' + username.toUpperCase() + '-' + Math.floor(100 + Math.random() * 900);
      const regTs = Date.now();
      const { data: authData, error: authError } = await supabaseClient.auth.signUp({
        email: phoneToAuthEmail(phone),
        password: password,
        options: { data: buildProfileMetadata({
          username: username,
          regTimestamp: regTs,
          referralCode: refCode,
          referredBy: referralCodeToLink ? referralCodeToLink.toUpperCase() : null,
          preferredLang: currentLang
        }) }
      });
      if (authError) {
        const authMsg = authError.message || '';
        const isWeakPassword = authError.code === 'weak_password' || /password/i.test(authMsg) && /(least|short|weak|characters)/i.test(authMsg);
        if (isWeakPassword) {
          alert(currentLang === 'fa' ? '⚠️ رمز عبور باید حداقل ۶ رقم باشد.' : '⚠️ Password must be at least 6 digits.');
          return;
        }
        alert(currentLang === 'fa' ? ('❌ خطا در ساخت حساب: ' + authMsg) : ('❌ Could not create account: ' + authMsg));
        return;
      }
      const authUserId = authData && authData.user ? authData.user.id : null;

      const users = getUsersDatabase();

      // معرف مستقیم؛ فقط وقتی واقعاً پیدا شود ثبت می‌شود (تا کدِ معلق ذخیره نشود و با شمارنده‌ی زیرمجموعه‌ها هم‌خوان بماند)
      let uplineUser = null;
      if (referralCodeToLink) {
        uplineUser = users.find(u => u.referralCode && u.referralCode.toUpperCase() === referralCodeToLink.toUpperCase()) || null;
        // معرف ممکن است فقط روی دستگاه دیگری ثبت‌نام کرده باشد، نه همین مرورگر
        if (!uplineUser) {
          uplineUser = await supaFindUserByReferralCode(referralCodeToLink);
          if (uplineUser && !uplineUser.partial && !users.some(u => u.phone === uplineUser.phone)) users.push(uplineUser);
        }
        if (uplineUser) {
          uplineUser.totalReferrals = (uplineUser.totalReferrals || 0) + 1;
          // تاریخ‌دار برای شمارش امتیاز ماهانه‌ی چالش «آواتار اختصاصی»
          if (!Array.isArray(uplineUser.referralLog)) uplineUser.referralLog = [];
          uplineUser.referralLog.push({ ts: Date.now() });
        }
      }

      // ===== زیرمجموعه‌ی هدیه: ثبت‌نامِ بدون کد معرف، تصادفی به یکی از برندگانِ دارای جای خالی می‌رسد =====
      // (در شمارنده‌ی زیرمجموعه/تخفیف پلکانی/آواتارها حساب نمی‌شود؛ ولی چون referredBy دارد، پورسانت خرید فعال است)
      let giftPoolToSave = null, giftEntry = null;
      if (!uplineUser) {
        const pool = readGiftPool();
        const open = pool.filter(e => e.filled < e.quota && users.some(u => u.phone === e.phone));
        if (open.length) {
          giftEntry = open[Math.floor(Math.random() * open.length)];
          uplineUser = users.find(u => u.phone === giftEntry.phone);
          giftEntry.filled += 1;
          if (!Array.isArray(uplineUser.giftSubs)) uplineUser.giftSubs = [];
          uplineUser.giftSubs.push({ phone: phone, username: username, ts: regTs, rank: giftEntry.rank });
          giftPoolToSave = pool;
        }
      }

      const nowTimestamp = regTs;
      const uniqueVouchers = generateUniqueVouchers(username);

      const newUser = {
        phone: phone,
        username: username,
        authUserId: authUserId,
        regTimestamp: nowTimestamp,
        referralCode: refCode,
        referredBy: uplineUser ? uplineUser.referralCode.toUpperCase() : null,
        giftedBy: giftEntry ? giftEntry.phone : null,
        userVouchers: uniqueVouchers,
        wallet: 0,
        totalReferrals: 0,
        phoneVerified: false,
        avatar: '👤',
        // زبانی که کاربر هنگام ثبت‌نام روی سایت داشته، به‌عنوان زبان پیش‌فرض حساب او ذخیره می‌شود
        preferredLang: currentLang,
        readingLogs: [
          { date: new Date(nowTimestamp).toLocaleDateString(currentLang === 'fa' ? 'fa-IR' : 'en-US'), dayKey: getLocalDayKey(new Date(nowTimestamp)), minutes: 0 }
        ],
        purchasedBooks: []
      };

      // ثبت پروفایل در دیتابیس مشترک؛ این بار منتظر نتیجه می‌مونیم (تا ۳ بار تلاش).
      // فقط اگه واقعاً ذخیره شد، کاربر محلی ساخته می‌شه و پیام موفقیت نشون داده می‌شه.
      const profileSaved = await supaInsertUser(newUser);
      if (!profileSaved) {
        alert(currentLang === 'fa'
          ? '⚠️ ثبت‌نام کامل نشد. لطفاً اینترنت خود را بررسی کنید و با همین شماره و رمز وارد شوید؛ حساب شما هنگام ورود به‌صورت خودکار تکمیل می‌شود.'
          : '⚠️ Registration was not completed. Please check your connection and log in with the same number and password; your account will be completed automatically on login.');
        return;
      }

      users.push(newUser);
      if (giftPoolToSave && !writeGiftPool(giftPoolToSave)) { notifyStorageFailure(); return; }
      if (!saveUsersDatabase(users)) {
        if (giftPoolToSave && giftEntry) { giftEntry.filled -= 1; writeGiftPool(giftPoolToSave); }
        return;
      }

      localStorage.setItem('pdf_market_active_session', JSON.stringify(newUser));
      alert(currentLang === 'fa' ? '🎉 حساب کاربری شما با موفقیت ساخته شد.' : '🎉 Your account has been created successfully.');
      finishAuthSuccess();
    }

    function openForgotPasswordFlow(e) {
      e.preventDefault();
      document.getElementById('authTabHeader').style.display = 'none';
      document.getElementById('authModalHeaderTitle').textContent = currentLang === 'fa' ? 'بازیابی رمز عبور با پیامک' : 'Password Recovery via SMS';
      document.getElementById('loginForm').style.display = 'none';
      document.getElementById('registerFlow').style.display = 'none';

      const forgotFlow = document.getElementById('forgotFlow');
      forgotFlow.style.display = 'block';
      document.getElementById('forgotStep1Form').style.display = 'flex';
      document.getElementById('forgotStep2Form').style.display = 'none';
    }

    async function handleSendForgotOtp(e) {
      e.preventDefault();
      const phone = normalizeDigits(document.getElementById('forgotPhone').value.trim());
      const users = getUsersDatabase();
      let user = users.find(u => u.phone === phone);

      // اگر روی همین دستگاه پیدا نشد، ممکنه کاربر روی دستگاه/مرورگر دیگری ثبت‌نام کرده باشه؛
      // درست مثل ورود با رمز عبور، از Supabase (دیتابیس مشترک) هم چک می‌کنیم تا بازیابی رمز
      // برای شماره‌هایی که واقعاً در سایت ثبت‌شدن ولی روی این مرورگر نیستن هم کار کنه.
      if (!user) {
        const remoteUser = await supaFindUser({ phone });
        if (remoteUser) {
          user = mergeRemoteUserIntoLocal(remoteUser);
        }
      }

      if (!user) {
        alert(currentLang === 'fa' ? '❌ حسابی با این شماره تلفن یافت نشد!' : '❌ No account found with this phone number!');
        return;
      }

      // کد را سرور می‌سازد (نه مرورگر). در حالت تست، سرور کد را برمی‌گرداند تا همین‌جا نشان داده شود.
      let r;
      try {
        r = await resetApi({ action: 'send', phone });
      } catch (err) {
        alert(currentLang === 'fa' ? '❌ اتصال به سرور برقرار نشد. دوباره تلاش کنید.' : '❌ Could not reach the server. Please try again.');
        return;
      }
      if (!r.ok) {
        if (r.error === 'too_soon') alert(currentLang === 'fa' ? ('⏳ لطفاً ' + r.wait + ' ثانیه دیگر دوباره تلاش کنید.') : ('⏳ Please wait ' + r.wait + 's and try again.'));
        else if (r.error === 'no_account') alert(currentLang === 'fa' ? '❌ حسابی با این شماره تلفن یافت نشد!' : '❌ No account found with this phone number!');
        else if (r.error === 'not_configured') alert(currentLang === 'fa' ? '⚠️ سرور بازیابی رمز هنوز تنظیم نشده (reset-config.php).' : '⚠️ Password reset server is not configured yet (reset-config.php).');
        else alert(currentLang === 'fa' ? '❌ ارسال کد ناموفق بود.' : '❌ Could not send the code.');
        return;
      }
      pendingForgotPasswordData = { type: 'forgot', phone };

      const smsBanner = document.getElementById('simulatedSmsBanner');
      if (r.test_otp) {
        smsBanner.style.display = 'block';
        smsBanner.innerHTML = `📲 <strong>SMS Recovery:</strong> OTP: <span style="font-size:1.15rem; font-weight:800; color:#d32f2f;">${r.test_otp}</span>`;
      } else {
        smsBanner.style.display = 'none';
      }

      document.getElementById('forgotStep1Form').style.display = 'none';
      document.getElementById('forgotStep2Form').style.display = 'flex';
    }

    async function resetApi(payload) {
      const res = await fetch('reset-password.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      try { return await res.json(); } catch (e) { return { ok: false, error: 'bad_response' }; }
    }

    async function handleResetPasswordSubmit(e) {
      e.preventDefault();
      const enteredOtp = normalizeDigits(document.getElementById('forgotOtpInput').value.trim());
      const newPassword = normalizeDigits(document.getElementById('forgotNewPassword').value.trim());

      if (!/^[0-9]+$/.test(newPassword)) {
        alert(currentLang === 'fa' ? '⚠️ رمز عبور فقط می‌تواند شامل عدد باشد.' : '⚠️ Password can only contain digits.');
        return;
      }
      if (newPassword.length < 6) {
        alert(currentLang === 'fa' ? '⚠️ رمز عبور باید حداقل ۶ رقم باشد.' : '⚠️ Password must be at least 6 digits.');
        return;
      }
      if (!pendingForgotPasswordData) {
        alert(currentLang === 'fa' ? '⚠️ ابتدا کد پیامکی را دریافت کنید.' : '⚠️ Please request the SMS code first.');
        return;
      }

      // چک کد و تغییر رمز کاملاً سمت سرور (reset-password.php) انجام می‌شود.
      const phone = pendingForgotPasswordData.phone;
      let r;
      try {
        r = await resetApi({ action: 'reset', phone, otp: enteredOtp, password: newPassword });
      } catch (err) {
        alert(currentLang === 'fa' ? '❌ اتصال به سرور برقرار نشد. دوباره تلاش کنید.' : '❌ Could not reach the server. Please try again.');
        return;
      }
      if (!r.ok) {
        const fa = {
          wrong_code: '❌ کد واردشده نادرست است!',
          expired: '⌛ کد منقضی شده؛ دوباره کد بگیرید.',
          too_many_tries: '⛔ تلاش اشتباه زیاد بود؛ دوباره کد بگیرید.',
          supabase: '❌ تغییر رمز در سرور ناموفق بود' + (r.detail ? (': ' + r.detail) : '') + '.'
        };
        const en = {
          wrong_code: '❌ Incorrect verification code!',
          expired: '⌛ The code has expired; request a new one.',
          too_many_tries: '⛔ Too many wrong attempts; request a new code.',
          supabase: '❌ Password change failed on the server' + (r.detail ? (': ' + r.detail) : '') + '.'
        };
        alert((currentLang === 'fa' ? fa : en)[r.error] || (currentLang === 'fa' ? '❌ بازیابی رمز ناموفق بود.' : '❌ Password reset failed.'));
        return;
      }

      // رمز عوض شد → با رمز جدید وارد می‌کنیم (مثل ورود عادی)
      pendingForgotPasswordData = null;
      document.getElementById('simulatedSmsBanner').style.display = 'none';
      if (!supabaseClient) {
        alert(currentLang === 'fa' ? '✅ رمز عوض شد. حالا با رمز جدید وارد شوید.' : '✅ Password changed. Please sign in with your new password.');
        return;
      }
      const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
        email: phoneToAuthEmail(phone),
        password: newPassword
      });
      if (authError || !authData || !authData.user) {
        alert(currentLang === 'fa' ? '✅ رمز عوض شد. حالا با رمز جدید وارد شوید.' : '✅ Password changed. Please sign in with your new password.');
        return;
      }
      let user = await supaFindUser({ phone });
      if (!user) {
        const repaired = await supaRepairProfile(authData.user, phone);
        if (repaired) user = (await supaFindUser({ phone })) || repaired;
      }
      if (!user) {
        alert(currentLang === 'fa' ? '✅ رمز عوض شد، اما بارگذاری حساب مشکل داشت. دوباره وارد شوید.' : '✅ Password changed, but loading the account failed. Please sign in again.');
        return;
      }
      user = mergeRemoteUserIntoLocal(user);
      localStorage.setItem('pdf_market_active_session', JSON.stringify(user));
      alert(currentLang === 'fa' ? '✅ رمز عبور با موفقیت تغییر کرد.' : '✅ Your password was changed successfully.');
      if (user.preferredLang && user.preferredLang !== currentLang && !window.PAGE_LANG) toggleLanguage();
      finishAuthSuccess();
    }

    function openUserPanelModal(fromRestore) {
      if (!currentActiveUser) {
        openAuthModal('login');
        return;
      }
      initUserAuthState();
      document.getElementById('userPanelModal').style.display = 'flex';
      if (!fromRestore) rememberOpenModal('panel');
      document.title = (currentLang === 'fa' ? 'پنل شخصی کاربر | ' : 'My Account | ') + brandPlainName();
    }

    function closeUserPanelModal() {
      document.getElementById('userPanelModal').style.display = 'none';
      forgetOpenModal('panel');
      document.title = homeDocTitle();
    }

    function handleUserLogout() {
      const confirmMsg = currentLang === 'fa' ? 'آیا مایل به خروج از حساب کاربری خود هستید؟' : 'Are you sure you want to log out?';
      if (confirm(confirmMsg)) {
        if (supabaseClient) { try { supabaseClient.auth.signOut(); } catch (e) {} }
        localStorage.removeItem('pdf_market_active_session');
        // سبد خرید و کتاب‌های ذخیره‌شده به مرورگر گره خورده‌اند، نه کاربر؛ پس هنگام خروج پاک می‌شوند
        cartBookIds = [];
        savedBookIds = [];
        updateSavedBooksBadge();
        appliedDiscountPercentage = 0;
        appliedVoucherCode = null;
        appliedVoucherBookId = null;
        localStorage.removeItem('pdf_market_cart_ids');
        localStorage.removeItem('pdf_market_saved_books');
        if (activeReadingInterval) {
          clearInterval(activeReadingInterval);
          activeReadingInterval = null;
        }
        closeUserPanelModal();
        initUserAuthState();
        handleSmartSearch();
        updateSpotlight();
      }
    }





    // ---- ادامه‌ی مطالعه + همگام‌سازی بین دستگاه‌ها ----
    // پیشرفت هر کتاب: user.readingProgress[bookId] = { page, total, ts }
    // همگام‌سازی از طریق دو تابع امن Supabase (RPC) انجام می‌شود که فقط ستون‌های readingProgress و purchased_books
    // خودِ کاربرِ واردشده را عوض می‌کنند (SQL آن‌ها در فایل راهنما است). اگر هنوز ساخته نشده باشند، سایت بدون خطا فقط محلی کار می‌کند.
    const STATUS_RANK = { unread: 0, reading: 1, finished: 2 };
    function mergePurchasedBooks(a, b) {
      const map = new Map();
      (a || []).concat(b || []).forEach(pb => {
        if (!pb || pb.id == null) return;
        const k = String(pb.id);
        const cur = map.get(k);
        if (!cur) { map.set(k, Object.assign({}, pb)); return; }
        const st = (STATUS_RANK[pb.status] || 0) > (STATUS_RANK[cur.status] || 0) ? pb.status : cur.status;
        map.set(k, Object.assign({}, cur, pb, { status: st || 'unread', ts: cur.ts || pb.ts }));
      });
      return Array.from(map.values());
    }
    function mergeReadingProgress(a, b) {
      const out = Object.assign({}, a || {});
      Object.keys(b || {}).forEach(k => {
        if (!out[k] || ((b[k] && b[k].ts) || 0) > (out[k].ts || 0)) out[k] = b[k];
      });
      return out;
    }

    let userSyncTimer = null;
    let userSyncLast = '';
    let userSyncBusy = false;
    let userSyncDisabled = false;
    function scheduleUserSync(delay) {
      clearTimeout(userSyncTimer);
      userSyncTimer = setTimeout(syncUserData, delay == null ? 15000 : delay);
    }
    async function syncUserData() {
      if (userSyncDisabled || userSyncBusy || !supabaseClient || !currentActiveUser) return;
      try {
        const { data } = await supabaseClient.auth.getSession();
        if (!data || !data.session) return;
        const prog = currentActiveUser.readingProgress || {};
        const purchased = currentActiveUser.purchasedBooks || [];
        const sig = currentActiveUser.phone + '|' + JSON.stringify([prog, purchased]);
        if (sig === userSyncLast) return;
        userSyncBusy = true;
        const r1 = await supabaseClient.rpc('save_reading_progress', { p_progress: prog });
        const r2 = await supabaseClient.rpc('save_purchased_books', { p_books: purchased });
        userSyncBusy = false;
        const err = r1.error || r2.error;
        if (err) {
          console.warn('sync error:', err.message || err);
          if (err.code === 'PGRST202' || err.code === '42883') userSyncDisabled = true;
          return;
        }
        userSyncLast = sig;
      } catch (e) {
        userSyncBusy = false;
        console.warn('sync failed:', e);
      }
    }
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') syncUserData(); });

    function recordReadingProgress(bookId, page, total) {
      if (!currentActiveUser || !(page > 0) || !(total > 0)) return;
      const prev = (currentActiveUser.readingProgress || {})[bookId];
      if (prev && prev.page === page && prev.total === total) return;
      const users = getUsersDatabase();
      const uIdx = users.findIndex(u => u.phone === currentActiveUser.phone);
      if (uIdx === -1) return;
      const u = users[uIdx];
      if (!u.readingProgress) u.readingProgress = {};
      u.readingProgress[bookId] = { page: page, total: total, ts: Date.now() };
      const pb = (u.purchasedBooks || []).find(x => String(x.id) === String(bookId));
      if (pb) {
        if (pb.status === 'unread' && page > 1) pb.status = 'reading';
        if (pb.status !== 'finished' && page / total >= 0.95) pb.status = 'finished';
      }
      saveUsersDatabase(users);
      currentActiveUser = u;
      localStorage.setItem('pdf_market_active_session', JSON.stringify(u));
      scheduleUserSync();
    }

    function bookProgressInfo(bookId) {
      const p = currentActiveUser && currentActiveUser.readingProgress ? currentActiveUser.readingProgress[bookId] : null;
      if (!p || !(p.page > 0) || !(p.total > 0)) return null;
      return { page: p.page, total: p.total, pct: Math.min(100, Math.round(p.page / p.total * 100)), ts: p.ts || 0 };
    }

    let readerInstance = null;
    let readerSeq = 0;
    let secureReaderPromise = null;
    function loadSecureReader() {
      if (window.SecureReader) return Promise.resolve();
      if (!secureReaderPromise) {
        secureReaderPromise = new Promise((ok, fail) => {
          const s = document.createElement('script');
          s.src = 'assets/pdfjs/secure-reader.js?v=16';
          s.onload = () => ok();
          s.onerror = () => { secureReaderPromise = null; fail(new Error('reader script')); };
          document.head.appendChild(s);
        });
      }
      return secureReaderPromise;
    }
    function warmReader() {
      try {
        if (!currentActiveUser) return;
        const has = (currentActiveUser.purchasedBooks || []).some(pb => { const bk = books.find(x => x.id === pb.id); return bk && bk.hasPdf; });
        if (has) loadSecureReader().then(() => window.SecureReader.preload()).catch(() => {});
      } catch (e) {}
    }
    function releaseReaderPdf() {
      readerSeq++;
      if (readerInstance) { try { readerInstance.destroy(); } catch (e) {} readerInstance = null; scheduleUserSync(500); }
    }

    async function openReader(bookId) {
      const b = books.find(item => item.id === bookId);
      const t = translations[currentLang];
      const body = document.getElementById('readerBodyText');
      const sampleHtml = ` <p><strong>${t.authorLabel}: ${b.author[currentLang]} | ${t.genreLabel}: ${b.genre[currentLang]}</strong></p> <p style="margin-top: 10px;">${t.sampleText}</p> `;
      releaseReaderPdf();
      const seq = readerSeq;
      document.getElementById('readerHeading').textContent = `${t.readerTitlePrefix}${b.title[currentLang]}`;
      body.innerHTML = sampleHtml;
      document.getElementById('readerModal').style.display = 'flex';

      // زمان مطالعه فقط از همین‌جا (باز شدن PDF/خواننده) شروع می‌شود؛ گشت‌وگذار در سایت هیچ زمانی ثبت نمی‌کند
      if (currentActiveUser) startReadingTracking();

      // کتابِ خریداری‌شده‌ای که PDF دارد: فایل از سرور (read-pdf.php) گرفته و داخل خواننده‌ی اختصاصی سایت
      // (بدون دکمه‌ی دانلود/پرینت مرورگر) نشان داده می‌شود.
      const owned = currentActiveUser && (currentActiveUser.purchasedBooks || []).some(pb => String(pb.id) === String(b.id));
      if (!b.hasPdf || !owned) return;
      const fa = currentLang === 'fa';
      const loadingText = fa ? 'در حال بارگذاری کتاب…' : 'Loading your book…';
      body.innerHTML = `<p>${loadingText}</p>`;
      try {
        // کتابخانه‌ی خواننده همزمان با دریافت فایل بارگذاری می‌شود (نه بعد از آن)
        const libReady = loadSecureReader().then(() => window.SecureReader.preload());
        libReady.catch(() => {});
        let token = '';
        if (supabaseClient) {
          const { data } = await supabaseClient.auth.getSession();
          token = data && data.session ? data.session.access_token : '';
        }
        if (!token) throw new Error(fa ? 'نشست ورود شما پیدا نشد؛ یک بار خارج و دوباره وارد شوید.' : 'No login session found; please sign out and sign in again.');
        const res = await fetch('read-pdf.php?id=' + encodeURIComponent(b.id), { headers: { Authorization: 'Bearer ' + token } });
        if (!res.ok) {
          let msg = '';
          try { msg = (await res.json()).msg; } catch (e) {}
          throw new Error(msg || (fa ? 'دریافت کتاب ممکن نشد.' : 'Could not load the book.'));
        }
        const total = Number(res.headers.get('Content-Length')) || 0;
        let data;
        if (total && res.body && res.body.getReader) {
          const rd = res.body.getReader();
          const buf = new Uint8Array(total);
          let got = 0;
          for (;;) {
            const part = await rd.read();
            if (part.done) break;
            if (got + part.value.length > buf.length) throw new Error(fa ? 'دریافت کتاب ممکن نشد.' : 'Could not load the book.');
            buf.set(part.value, got);
            got += part.value.length;
            if (seq === readerSeq) body.innerHTML = `<p>${loadingText} ${Math.round(got / total * 100)}%</p>`;
          }
          data = buf.buffer;
        } else {
          data = await res.arrayBuffer();
        }
        if (seq !== readerSeq) return;
        await libReady;
        if (seq !== readerSeq) return;
        readerInstance = window.SecureReader.open({
          host: body,
          data: data,
          title: b.title[currentLang],
          bookId: b.id,
          lang: currentLang,
          textKind: b.pdfKind || '', startPage: ((currentActiveUser.readingProgress || {})[b.id] || {}).page || 0, onProgress: (pg, tot) => recordReadingProgress(b.id, pg, tot), onClose: closeReader
        });
      } catch (e) {
        if (seq !== readerSeq) return;
        body.innerHTML = `<p style="color:#e57373;">${e.message}</p>` + sampleHtml;
      }
    }




    // ===== ثبت زمان مطالعه: فقط وقتی PDF باز است و تب دیده می‌شود؛ زمان آفلاین در صف می‌ماند تا آنلاین شود =====
    const READING_TICK_MS = 15000;                 // هر ۱۵ ثانیه زمان سپری‌شده در صف ذخیره می‌شود (بستن ناگهانی تب فقط تا ۱۵ ثانیه را از دست می‌دهد)
    const READING_PENDING_KEY = 'pdf_market_pending_reading';   // { [phone]: { [dayKey]: seconds } }
    let readingLastTickTs = null;                  // null = در حال حاضر زمانی شمرده نمی‌شود (خواننده بسته یا تب پنهان)

    function readReadingPending() {
      try {
        const raw = JSON.parse(localStorage.getItem(READING_PENDING_KEY) || '{}');
        return (raw && typeof raw === 'object' && !Array.isArray(raw)) ? raw : {};
      } catch (e) {
        return {};
      }
    }

    function writeReadingPending(obj) {
      try {
        if (Object.keys(obj).length === 0) localStorage.removeItem(READING_PENDING_KEY);
        else localStorage.setItem(READING_PENDING_KEY, JSON.stringify(obj));
      } catch (e) { /* حافظه‌ی مرورگر پر یا غیرفعال است */ }
    }

    function getPendingReadingSeconds(phone) {
      const mine = readReadingPending()[phone];
      if (!mine) return 0;
      return Object.keys(mine).reduce((acc, k) => acc + (Number(mine[k]) || 0), 0);
    }

    // ثانیه‌ها روی «روزی که واقعاً مطالعه شده» (روزِ شروع همان بازه) ذخیره می‌شوند، نه روزی که ثبت نهایی می‌شود (مطالعه‌ی آفلاینِ دیشب امروز نوشته نمی‌شود)
    function queueReadingSeconds(phone, seconds, segmentStartTs) {
      if (!phone || !(seconds > 0)) return;
      const all = readReadingPending();
      const dayKey = getLocalDayKey(new Date(segmentStartTs || Date.now()));
      if (!all[phone]) all[phone] = {};
      all[phone][dayKey] = (Number(all[phone][dayKey]) || 0) + seconds;
      writeReadingPending(all);
    }

    // ثبت رسمی دقایق صف‌شده‌ی کاربر فعلی در حسابش. آفلاین = همه‌چیز در صف می‌ماند؛ ثانیه‌های کمتر از یک دقیقه هم برای بعد نگه داشته می‌شوند.
    // نکته: چون سایت هنوز سرور ندارد، «ثبت» یعنی اضافه شدن به readingLogs همین کاربر؛ بعداً همین‌جا می‌شود درخواست API سرور را فرستاد.
    function syncPendingReading() {
      if (!currentActiveUser) return;
      if (typeof navigator !== 'undefined' && navigator.onLine === false) return;
      const all = readReadingPending();
      const phone = currentActiveUser.phone;
      const mine = all[phone];
      if (!mine) return;

      const toCredit = [];
      Object.keys(mine).sort().forEach(dayKey => {
        const whole = Math.floor((Number(mine[dayKey]) || 0) / 60);
        if (whole > 0) {
          mine[dayKey] -= whole * 60;
          toCredit.push([dayKey, whole]);
        }
        if (!(mine[dayKey] > 0)) delete mine[dayKey];
      });
      if (toCredit.length === 0) return;
      if (Object.keys(mine).length === 0) delete all[phone];
      writeReadingPending(all);   // اول از صف کم می‌شود، بعد ثبت می‌شود؛ تا هیچ دقیقه‌ای دوبار حساب نشود
      toCredit.forEach(([dayKey, mins]) => recordReadingProgress(mins, dayKey));
    }

    function commitReadingElapsed(skipSync) {
      if (readingLastTickTs === null) return;
      if (activeReadingInterval === null || !currentActiveUser) { readingLastTickTs = null; return; }
      const nowTs = Date.now();
      const segmentStartTs = readingLastTickTs;
      let elapsedMs = Math.max(nowTs - segmentStartTs, 0);
      // اگر تایمر خیلی بیشتر از حد معمول متوقف بوده (خواب دستگاه)، آن فاصله مطالعه حساب نمی‌شود
      if (elapsedMs > READING_TICK_MS * 2) elapsedMs = READING_TICK_MS;
      readingLastTickTs = nowTs;
      queueReadingSeconds(currentActiveUser.phone, Math.round(elapsedMs / 1000), segmentStartTs);
      if (!skipSync) syncPendingReading();
    }

    function readingTick() {
      if (!currentActiveUser) { stopReadingTracking(); return; }
      if (document.visibilityState === 'hidden') {
        commitReadingElapsed(true);
        readingLastTickTs = null;
        return;
      }
      if (readingLastTickTs === null) { readingLastTickTs = Date.now(); return; }
      commitReadingElapsed(false);
    }

    function startReadingTracking() {
      commitReadingElapsed(true);   // اگر خواننده دوباره باز شد، زمان قبلی از دست نرود
      if (activeReadingInterval) clearInterval(activeReadingInterval);
      readingLastTickTs = (document.visibilityState === 'hidden') ? null : Date.now();
      activeReadingInterval = setInterval(readingTick, READING_TICK_MS);
    }

    function stopReadingTracking() {
      commitReadingElapsed(true);
      readingLastTickTs = null;
      if (activeReadingInterval) {
        clearInterval(activeReadingInterval);
        activeReadingInterval = null;
      }
    }

    // تب پنهان شد (رفتن به تب دیگر/قفل صفحه) = مطالعه متوقف؛ برگشت = ادامه
    function onReadingVisibilityChange() {
      if (activeReadingInterval === null) return;
      if (document.visibilityState === 'hidden') {
        commitReadingElapsed(true);
        readingLastTickTs = null;
      } else {
        if (readingLastTickTs === null) readingLastTickTs = Date.now();
        syncPendingReading();
      }
    }

    function renderReadingPendingNote() {
      const noteEl = document.getElementById('panelReadingPendingNote');
      if (!noteEl) return;
      const pendingMins = currentActiveUser ? Math.floor(getPendingReadingSeconds(currentActiveUser.phone) / 60) : 0;
      if (pendingMins >= 1) {
        noteEl.style.display = 'block';
        noteEl.textContent = currentLang === 'fa'
          ? `⏳ ${pendingMins} دقیقه مطالعه‌ی آفلاین در انتظار ثبت است و پس از اتصال به اینترنت به زمان کل اضافه می‌شود.`
          : `⏳ ${pendingMins} min of offline reading is pending and will be added to your total once you are back online.`;
      } else {
        noteEl.style.display = 'none';
        noteEl.textContent = '';
      }
    }

    window.addEventListener('online', () => { initUserAuthState(); });          // آنلاین شدن: صف آفلاین ثبت و پنل تازه می‌شود
    document.addEventListener('visibilitychange', onReadingVisibilityChange);
    window.addEventListener('pagehide', () => commitReadingElapsed(true));      // بستن/رفرش تب: زمان سپری‌شده در صف ذخیره می‌شود

    function recordReadingProgress(minsToAdd, dayKeyOverride) {
      if (!currentActiveUser) return;
      const now = new Date();
      const todayKey = dayKeyOverride || getLocalDayKey(now); // کلید مستقل از زبان و بر اساس ساعت محلی، برای تشخیص «همون روز»
      const todayStr = dayKeyOverride
        ? formatDayKey(dayKeyOverride, currentLang === 'fa' ? 'fa-IR' : 'en-US')
        : now.toLocaleDateString(currentLang === 'fa' ? 'fa-IR' : 'en-US');
      const users = getUsersDatabase();
      const userIndex = users.findIndex(u => u.phone === currentActiveUser.phone);

      if (userIndex !== -1) {
        if (!users[userIndex].readingLogs) users[userIndex].readingLogs = [];
        let todayLog = users[userIndex].readingLogs.find(l => l.dayKey === todayKey);

        if (todayLog) {
          todayLog.minutes = (todayLog.minutes || 0) + minsToAdd;
        } else {
          users[userIndex].readingLogs.push({ date: todayStr, dayKey: todayKey, minutes: minsToAdd });
        }

        // ===== پاداش پله‌ای مطالعه: هر ۵۰ ساعت (۳۰۰۰ دقیقه) یک کد ۴۰٪ =====
        // بر اساس «پله» بررسی می‌شود نه برابری دقیق؛ پس اگر مجموع از پله رد شد هم پاداش نمی‌سوزد
        const user = users[userIndex];
        const totalMinutes = user.readingLogs.reduce((acc, l) => acc + (l.minutes || 0), 0);
        const milestoneHours = Math.floor(totalMinutes / 3000) * 50;
        let rewardedHours = 0;
        if (milestoneHours > 0 && milestoneHours > (user.lastReadingHoursRewarded || 0)) {
          user.lastReadingHoursRewarded = milestoneHours;
          const newCode = generateVoucherCode('READ40');
          if (!Array.isArray(user.userVouchers)) user.userVouchers = [];
          // طبق قانون سایت، دو کوپن هم‌درصد هم‌زمان مجاز نیست؛ کوپن ۴۰٪ قبلی (اگر بود) حذف می‌شود
          user.userVouchers = user.userVouchers.filter(v => v.percent !== 40);
          user.userVouchers.push({
            labelFa: `هدیه مطالعه ${milestoneHours} ساعت (۴۰٪):`,
            labelEn: `Reading Reward (${milestoneHours} Hours - 40%):`,
            code: newCode,
            percent: 40
          });
          rewardedHours = milestoneHours;
        }

        saveUsersDatabase(users);
        currentActiveUser = users[userIndex];
        localStorage.setItem('pdf_market_active_session', JSON.stringify(currentActiveUser));

        if (rewardedHours > 0) {
          const hoursFa = String(rewardedHours).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
          alert(currentLang === 'fa'
            ? `🎉 تبریک! شما به ${hoursFa} ساعت مطالعه رسیدید. کد تخفیف ویژه ۴۰٪ هدیه مطالعه به پنل شما اضافه شد!`
            : `🎉 Congratulations! You reached ${rewardedHours} hours of reading. A special 40% reading reward voucher has been added to your panel!`);
        }
      }
    }

    function closeReader() {releaseReaderPdf();
      document.getElementById('readerModal').style.display = 'none';
      stopReadingTracking();   // زمان سپری‌شده‌ی آخر (کمتر از یک تیک) هم قبل از بستن ذخیره می‌شود
      initUserAuthState();
    }

    function goToSupportModalFromPanel() {
      closeUserPanelModal();
      openQuestionModal('feedback');
    }

    function openQuestionModal(defaultTab = 'question') {
      closeAboutModal();
      document.getElementById('questionModal').style.display = 'flex';
      switchSupportTab(defaultTab);
    }

    function closeQuestionModal() {
      document.getElementById('questionModal').style.display = 'none';
    }

    function switchSupportTab(tab) {
      const tabQuestion = document.getElementById('tabSupportQuestion');
      const tabFeedback = document.getElementById('tabSupportFeedback');
      const questionSec = document.getElementById('supportQuestionSection');
      const feedbackSec = document.getElementById('supportFeedbackSection');
      const notLoggedIn = document.getElementById('feedbackNotLoggedInBox');
      const feedbackForm = document.getElementById('feedbackForm');

      if (tab === 'question') {
        tabQuestion.classList.add('active');
        tabFeedback.classList.remove('active');
        questionSec.style.display = 'block';
        feedbackSec.style.display = 'none';
      } else {
        tabFeedback.classList.add('active');
        tabQuestion.classList.remove('active');
        questionSec.style.display = 'none';
        feedbackSec.style.display = 'block';

        if (currentActiveUser) {
          notLoggedIn.style.display = 'none';
          feedbackForm.style.display = 'flex';
          document.getElementById('feedbackUserBadge').textContent = currentActiveUser.username;
        } else {
          notLoggedIn.style.display = 'block';
          feedbackForm.style.display = 'none';
        }
      }
    }

    function handleQuestionSubmit(e) {
      e.preventDefault();
      alert(currentLang === 'fa' ? '✅ سوال شما با موفقیت ثبت شد و پس از بررسی پاسخ داده خواهد شد.' : '✅ Your question has been submitted successfully.');
      document.getElementById('askName').value = '';
      document.getElementById('askContact').value = '';
      document.getElementById('askMessage').value = '';
      closeQuestionModal();
    }

    function handleFeedbackSubmit(e) {
      e.preventDefault();
      const msg = document.getElementById('feedbackMessage').value.trim();
      if (!msg) return;
      alert(currentLang === 'fa' 
        ? `💐 از ثبت نظر و پیشنهاد ارزشمندتان سپاسگزاریم، ${currentActiveUser.username} گرامی!`
        : `💐 Thank you for your valuable feedback, ${currentActiveUser.username}!`);
      document.getElementById('feedbackMessage').value = '';
      closeQuestionModal();
    }

    function initWelcomeExperience() {
      const isFirstVisit = !localStorage.getItem('visited_before');
      // پیام خوشامدگویی فقط در صفحه‌ی اصلی (که فهرست #booksCatalog دارد) نمایش داده می‌شود؛
      // صفحه‌های نویسنده‌ها (و هر صفحه‌ی اختصاصی دیگر) این پنجره را نشان نمی‌دهند.
      const isHomePage = !!document.getElementById('booksCatalog');
      if (isFirstVisit && isHomePage) {
        document.getElementById('newUserAlertBox').style.display = 'block';
        document.getElementById('welcomeEntryModal').style.display = 'flex';
      }
      applySmartAutoTheme();
      applySavedSpotlightColor();

      const urlParams = new URLSearchParams(window.location.search);
      const urlRef = urlParams.get('ref');
      if (urlRef) {
        sessionStorage.setItem('pdf_market_active_ref', urlRef);
      }
    }

    function closeWelcomeEntryModal() {
      document.getElementById('welcomeEntryModal').style.display = 'none';
      localStorage.setItem('visited_before', 'true');
    }

    function applySmartAutoTheme() {
      // اگه کاربر قبلاً خودش دستی یه تم از رنگین‌کمان انتخاب کرده، همون رو نگه دار
      // و کاری به تغییر خودکار روز/شب نداشته باش.
      const manualOverride = localStorage.getItem('theme_manual_override');
      if (manualOverride) {
        // اگه انتخاب قبلی کاربر یکی از دو تمِ رنگین‌کمانیِ متحرک بوده (نه یه رنگ ثابت)،
        // باید همون چرخش رو دوباره از نو استارت بزنیم، وگرنه با هر رفرش صفحه تمِ رنگین‌کمانی
        // خاموش می‌شد و به‌جاش یه رنگ ثابتِ تصادفی جایگزینش می‌شد (همون باگ قبلی).
        if (manualOverride === 'rainbow-dark' || manualOverride === 'rainbow-pastel') {
          startRainbowTheme(manualOverride === 'rainbow-dark' ? 'dark' : 'pastel');
          return;
        }
        applyFullTheme(manualOverride);
        return;
      }

      // کاربر جدید و کاربر قدیمی هر دو از همین مسیر می‌گذرن: بر اساس ساعت روز یا شب،
      // و از داخل پالت مربوطه به‌صورت تصادفی (مستقل برای هر دستگاه) یه تم انتخاب می‌شه.
      return applyRandomAutoTheme();
    }

    // پالت روز و شب مستقیم از allColors ساخته می‌شه (بر اساس روشنی رنگ)،
    // پس هر رنگی که به allColors اضافه بشه خودکار وارد قرعه‌کشی هم می‌شه.
    function isDarkColor(hex) {
      const rgb = parseInt(hex.substring(1), 16);
      const r = (rgb >> 16) & 0xff, g = (rgb >> 8) & 0xff, b = rgb & 0xff;
      return (0.2126 * r + 0.7152 * g + 0.0722 * b) < 128;
    }
    const dayThemePalette = allColors.filter(c => !isDarkColor(c));
    const nightThemePalette = allColors.filter(isDarkColor);

    // برای اینکه دو نفری که هم‌زمان (با دو گوشی جدا) وارد می‌شن *حتماً* تم متفاوت بگیرن،
    // دو گوشی باید به یه چیز مشترک وصل باشن؛ یعنی یه شمارنده‌ی ساده روی سرور.
    // آدرس فایل شمارنده (مثلاً '/theme-counter.php') رو اینجا بذار.
    // اگه خالی باشه یا سرور جواب نده، انتخاب تصادفی روی همون دستگاه انجام می‌شه.
    const THEME_COUNTER_URL = '';

    async function fetchThemeTicket() {
      if (!THEME_COUNTER_URL) return null;
      // سریع و بدون تلاش مجدد: اگر سرور جواب نداد، همان‌جا انتخاب تصادفی روی دستگاه انجام می‌شود
      const r = await Net.request(THEME_COUNTER_URL, { timeout: 1500, retries: 0, init: { cache: 'no-store' } });
      return (r.ok && r.data && Number.isInteger(r.data.n)) ? r.data.n : null;
    }

    function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }

    // شماره‌های پشت‌سرهم رو به رنگ‌های «دور از هم» نگاشت می‌کنه؛
    // دو بلیت متوالی همیشه دو رنگ متفاوت می‌گیرن
    function pickByTicket(palette, n) {
      let step = 7;
      while (gcd(step, palette.length) !== 1) step++;
      return palette[(n * step) % palette.length];
    }

    async function applyRandomAutoTheme() {
      // شب از ساعت ۱۸ شروع می‌شه و تا ۶ صبح روز بعد ادامه داره؛
      // برای اینکه نصف‌شب (ساعت ۰۰:۰۰) تم عوض نشه، کل این بازه رو با یه کلید ثابت مشخص می‌کنیم
      const now = new Date();
      const hour = now.getHours();
      const isNight = hour >= 18 || hour < 6;
      const period = isNight ? 'night' : 'day';
      const palette = isNight ? nightThemePalette : dayThemePalette;

      const anchor = new Date(now);
      if (hour < 6) {
        anchor.setDate(anchor.getDate() - 1); // بخش بعد از نیمه‌شب، به شب دیشب تعلق داره
      }
      const periodKey = anchor.toDateString();

      const keyName = period + '_theme_key';
      const colorName = period + '_theme_color';
      const savedKey = localStorage.getItem(keyName);
      const savedColor = localStorage.getItem(colorName);

      if (savedKey === periodKey && savedColor && palette.includes(savedColor)) {
        // همین بازه (همین روز/همین شب) قبلاً یه تم انتخاب شده، همون رو نگه دار (با هر رفرش عوض نشه)
        applyFullTheme(savedColor);
        return;
      }

      let chosen = null;
      if (THEME_COUNTER_URL) {
        const ticket = await fetchThemeTicket();
        // اگه تو این فاصله کاربر خودش دستی رنگ انتخاب کرد، دخالت نکن
        if (localStorage.getItem('theme_manual_override')) return;
        if (ticket !== null) chosen = pickByTicket(palette, ticket);
      }

      if (!chosen) {
        // حالت پشتیبان: تصادفی، ترجیحاً غیر از تم دفعه‌ی قبل
        let candidates = palette.filter(c => c !== savedColor);
        if (candidates.length === 0) candidates = palette;
        chosen = candidates[Math.floor(Math.random() * candidates.length)];
      }

      localStorage.setItem(keyName, periodKey);
      localStorage.setItem(colorName, chosen);

      applyFullTheme(chosen);
    }

    let drawerLockedScrollY = 0;

    function toggleDrawer() {
      const drawer = document.getElementById('sideDrawer');
      const overlay = document.getElementById('drawerOverlay');
      drawer.classList.toggle('open');
      overlay.classList.toggle('active');
      const isOpen = drawer.classList.contains('open');
      if (isOpen) {
        drawerLockedScrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
        document.body.style.top = -drawerLockedScrollY + 'px';
      }
      document.documentElement.classList.toggle('drawer-open', isOpen);
      document.body.classList.toggle('drawer-open', isOpen);
      if (!isOpen) {
        document.body.style.removeProperty('top');
        window.scrollTo(0, drawerLockedScrollY);
      }
    }

    function closeDrawer() {
      document.getElementById('sideDrawer').classList.remove('open');
      document.getElementById('drawerOverlay').classList.remove('active');
      document.documentElement.classList.remove('drawer-open');
      document.body.classList.remove('drawer-open');
      document.body.style.removeProperty('top');
      window.scrollTo(0, drawerLockedScrollY);
    }

    function toggleAccordion(listId) {
      const target = document.getElementById(listId);
      target.classList.toggle('open');
      if (listId === 'categoriesList') return; // static list, no dynamic render
      if (target.classList.contains('open') && target.dataset.shown === undefined) {
        renderDrawerChunk(listId);
      }
    }

    // لیست‌های ژانر/نویسنده/ناشر/مترجم فقط وقتی باز می‌شوند ساخته می‌شوند و هر بار حداکثر ۱۵۰ مورد،
    // تا با هزاران نام، باز کردن منو و اسکرول آن سنگین نشود
    const DRAWER_CHUNK = 150;
    const DRAWER_LIST_TYPES = { authorsList: 'author', publishersList: 'publisher', translatorsList: 'translator' };
    let drawerData = {};

    function drawerItemHtml(listId, value) {
      const v = escapeHtml(value);
      let call;
      if (listId === 'genresList') {
        call = 'filterByGenreGroup(this.dataset.v)';
      } else if (listId === 'authorsList') {
        // اگه این اسم به یه نویسنده با صفحه‌ی اختصاصی وصل باشه، لینک واقعی می‌سازیم؛
        // وگرنه (نویسنده‌ای که هنوز صفحه یا پروفایل نداره) همون فیلتر متنی قدیمی
        const matchedAuthor = authors.find(a => a.name[currentLang] === value);
        const authorUrl = matchedAuthor ? getAuthorPageUrl(matchedAuthor.id) : null;
        if (authorUrl) {
          return `<a class="accordion-item" data-v="${v}" href="${authorUrl}">${v}</a>`;
        }
        call = matchedAuthor ? `openAuthorProfile('${matchedAuthor.id}')` : `filterByEntity('author', this.dataset.v)`;
      } else {
        call = `filterByEntity('${DRAWER_LIST_TYPES[listId]}', this.dataset.v)`;
      }
      return `<div class="accordion-item" data-v="${v}" onclick="${call}">${v}</div>`;
    }

    function renderDrawerChunk(listId) {
      const list = document.getElementById(listId);
      const items = drawerData[listId] || [];
      const start = Number(list.dataset.shown || 0);
      const end = Math.min(start + DRAWER_CHUNK, items.length);
      const oldMore = list.querySelector('.accordion-more');
      if (oldMore) oldMore.remove();

      list.insertAdjacentHTML('beforeend', items.slice(start, end).map(v => drawerItemHtml(listId, v)).join(''));
      list.dataset.shown = String(end);

      if (end < items.length) {
        list.insertAdjacentHTML('beforeend',
          `<div class="accordion-item accordion-more" onclick="renderDrawerChunk('${listId}')">${translations[currentLang].drawerShowMore} (${items.length-end})</div>`);
      }
    }

    function populateDrawer() {
      const uniq = (fn) => [...new Set(books.map(fn))];
      drawerData = {
        authorsList: uniq(b => b.author[currentLang])
      };
      Object.keys(drawerData).forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.innerHTML = '';
        delete el.dataset.shown;
        if (el.classList.contains('open')) renderDrawerChunk(id);
      });
    }

    function renderFeaturedTrain() {
      const track = document.getElementById('trainTrack');
      track.innerHTML = featuredEntities.map(item => {
        const authorUrl = item.slug ? ((currentLang === 'en' ? 'en-author-' : 'author-') + encodeURIComponent(item.slug) + '.html') : (item.authorId ? getAuthorPageUrl(item.authorId) : null);
        const tag = authorUrl ? 'a' : 'div';
        const linkAttr = authorUrl
          ? `href="${authorUrl}"`
          : `onclick="${item.authorId?`openAuthorProfile('${item.authorId}')`:`filterByEntity('${item.type}', this.dataset.v)`}"`;
        return `
        <${tag} class="author-vertical-card" data-v="${escapeHtml((item.filterName||item.name)[currentLang])}" ${linkAttr}>
          ${item.image?`<img src="${item.image}" alt="${item.name[currentLang]}" class="author-img" loading="lazy" decoding="async">`:`<div class="author-icon-display">${item.avatarText}</div>`}
          <div class="author-floating-tooltip">${item.name[currentLang]}</div>
        </${tag}>
      `;
      }).join('');
    }

    function scrollTrainTrack(direction) {
      const track = document.getElementById('trainTrack');
      const scrollAmount = 240;
      const isRtl = document.documentElement.dir === 'rtl';

      if (direction === 'next') {
        track.scrollBy({ left: isRtl ? -scrollAmount : scrollAmount, behavior: 'smooth' });
      } else {
        track.scrollBy({ left: isRtl ? scrollAmount : -scrollAmount, behavior: 'smooth' });
      }
    }

    function filterByEntity(type, name) {
      // صفحه‌ی نویسنده لیست اصلی کتاب‌ها/فیلتر ندارد؛ کاربر را به صفحه‌ی اصلی می‌بریم
      if (!document.getElementById('booksCatalog')) { location.href = (currentLang === 'en' ? 'en.html' : 'index.html'); return; }
      activeFilter = { kind: 'entity', type, name };
      const sideDrawer = document.getElementById('sideDrawer');
      if (sideDrawer.classList.contains('open')) {
        toggleDrawer();
      }

      const t = translations[currentLang];
      const banner = document.getElementById('activeFilterBanner');
      banner.style.display = 'flex';
      document.getElementById('activeFilterText').textContent = `${t.filterPrefix}${name}`;

      document.getElementById('spotlightBox').style.display = 'none';
      if (spotlightIntervalId) clearInterval(spotlightIntervalId);

      const searchInput = document.getElementById('searchInput');
      searchInput.value = '';
      searchInput.placeholder = `${t.searchInFilterPrefix} "${name}"...`;

      handleSmartSearch();
      window.scrollTo({ top: 180, behavior: 'smooth' });
    }

    function filterByGenreGroup(groupKey) {
      // صفحه‌ی نویسنده لیست اصلی کتاب‌ها/فیلتر ندارد؛ کاربر را به صفحه‌ی اصلی می‌بریم
      if (!document.getElementById('booksCatalog')) { location.href = (currentLang === 'en' ? 'en.html' : 'index.html'); return; }
      if (!GENRE_GROUPS[groupKey]) return; // کلید نامعتبر، کاری نکن
      activeFilter = { kind: 'genreGroup', groupKey };
      const sideDrawer = document.getElementById('sideDrawer');
      if (sideDrawer.classList.contains('open')) {
        toggleDrawer();
      }

      const t = translations[currentLang];
      const groupLabel = GENRE_GROUPS[groupKey][currentLang];
      const banner = document.getElementById('activeFilterBanner');
      banner.style.display = 'flex';
      document.getElementById('activeFilterText').textContent = `${t.filterPrefix}${groupLabel}`;

      document.getElementById('spotlightBox').style.display = 'none';
      if (spotlightIntervalId) clearInterval(spotlightIntervalId);

      const searchInput = document.getElementById('searchInput');
      searchInput.value = '';
      searchInput.placeholder = `${t.searchInGenrePrefix}"${groupLabel}"...`;

      handleSmartSearch();
      window.scrollTo({ top: 180, behavior: 'smooth' });
    }

    function filterByGenreFromBio() {
      // صفحه‌ی نویسنده لیست اصلی کتاب‌ها/فیلتر ندارد؛ کاربر را به صفحه‌ی اصلی می‌بریم
      if (!document.getElementById('booksCatalog')) { location.href = (currentLang === 'en' ? 'en.html' : 'index.html'); return; }
      const b = books.find(item => item.id === currentBioBookId);
      if (b) {
        closeBookBio();
        filterByGenreGroup(b.genreGroup);
      }
    }

    function filterBySpecial(specialType) {
      // صفحه‌ی نویسنده لیست اصلی کتاب‌ها/فیلتر ندارد؛ کاربر را به صفحه‌ی اصلی می‌بریم
      if (!document.getElementById('booksCatalog')) { location.href = (currentLang === 'en' ? 'en.html' : 'index.html') + (specialType === 'discounted' ? '?deals=1' : ''); return; }
      activeFilter = { kind: 'special', type: specialType };
      closeDrawer();

      const t = translations[currentLang];
      let label = '';
      if (specialType === 'bestsellerSite') label = t.menuBestSite;
      else if (specialType === 'bestsellerIran') label = t.menuBestIran;
      else if (specialType === 'bestsellerWorld') label = t.menuBestWorld;
      else if (specialType === 'discounted') label = t.menuDiscounted;

      const banner = document.getElementById('activeFilterBanner');
      banner.style.display = 'flex';
      document.getElementById('activeFilterText').textContent = `${t.filterPrefix}${label}`;

      document.getElementById('spotlightBox').style.display = 'none';
      if (spotlightIntervalId) clearInterval(spotlightIntervalId);

      const searchInput = document.getElementById('searchInput');
      searchInput.value = '';
      searchInput.placeholder = `${t.searchInBestPrefix}${label}...`;

      handleSmartSearch();
    }

    function filterByCategory(categoryKey) {
      // صفحه‌ی نویسنده لیست اصلی کتاب‌ها/فیلتر ندارد؛ کاربر را به صفحه‌ی اصلی می‌بریم
      if (!document.getElementById('booksCatalog')) { location.href = (currentLang === 'en' ? 'en.html' : 'index.html'); return; }
      activeFilter = { kind: 'category', categoryKey };
      const sideDrawer = document.getElementById('sideDrawer');
      if (sideDrawer.classList.contains('open')) {
        toggleDrawer();
      }

      const t = translations[currentLang];
      const catKeyMap = {
        literature: 'catLiterature',
        history: 'catHistory',
        fiction: 'catFiction',
        psychology: 'catPsychology',
        success: 'catSuccess',
        philosophy: 'catPhilosophy'
      };
      const label = t[catKeyMap[categoryKey]] || categoryKey;

      const banner = document.getElementById('activeFilterBanner');
      banner.style.display = 'flex';
      document.getElementById('activeFilterText').textContent = `${t.filterPrefix}${label}`;

      document.getElementById('spotlightBox').style.display = 'none';
      if (spotlightIntervalId) clearInterval(spotlightIntervalId);

      const searchInput = document.getElementById('searchInput');
      searchInput.value = '';
      searchInput.placeholder = `${t.searchInGenrePrefix}"${label}"...`;

      handleSmartSearch();
      window.scrollTo({ top: 180, behavior: 'smooth' });
    }

    // ===== کلیک روی لوگو/اسم «PDF مارکت» =====
    // اگه کاربر توی یه حالت فیلترشده/جستجوشده یا با منوی باز باشه (یعنی «صفحه‌ی دیگه»)،
    // برمی‌گردونتش به حالت پیش‌فرض صفحه اصلی. اگه از قبل همین‌جوری روی صفحه اصلی باشه
    // (بدون فیلتر، بدون جستجو، بدون منوی باز)، به‌جاش کل صفحه رو رفرش می‌کنه.
    // این تابع مستقل از حالت (موبایل/دسکتاپ/حالت دسکتاپِ اجباری) کار می‌کنه چون
    // لوگو فقط یک‌بار توی HTML وجود داره و بین همه‌ی حالت‌ها مشترکه.
    // مسابقه فقط تو صفحه اصلی هست؛ از صفحه نویسنده به همون‌جا می‌ره و پنجره‌ش خودکار باز می‌شه
    function openContestModal() { location.href = (currentLang === 'en' ? 'en.html' : 'index.html') + '?contest=1'; }
    function handleLogoClick() {
      if (document.getElementById('authorBooksCatalog') || document.getElementById('bookProduct')) { location.href = (currentLang === 'en' ? 'en.html' : 'index.html'); return; }
      const searchInput = document.getElementById('searchInput');
      const drawer = document.getElementById('sideDrawer');
      const isDrawerOpen = drawer && drawer.classList.contains('open');
      const isHome = !activeFilter && !(searchInput && searchInput.value.trim()) && !isDrawerOpen;

      if (isHome) {
        location.reload();
        return;
      }

      if (isDrawerOpen) closeDrawer();
      clearFilter();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function clearFilter() {
      if (!document.getElementById('booksCatalog')) return; // این بخش فقط در صفحه‌ی اصلی وجود دارد
      activeFilter = null;
      displayedCount = INITIAL_FAMOUS_COUNT;
      document.getElementById('activeFilterBanner').style.display = 'none';
      document.getElementById('spotlightBox').style.display = 'flex';

      const t = translations[currentLang];
      const searchInput = document.getElementById('searchInput');
      searchInput.value = '';
      searchInput.placeholder = t.searchPlaceholder;
      hideSuggestions();

      handleSmartSearch();
      restartSpotlightTimer();
    }

    // اعداد فارسی/عربی رو به انگلیسی تبدیل می‌کنه تا parseInt بتونه درست بخونتش
    function convertPersianDigitsToEnglish(str) {
      const persian = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
      const arabic = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
      let result = String(str);
      for (let i = 0; i < 10; i++) {
        result = result.replace(new RegExp(persian[i], 'g'), i).replace(new RegExp(arabic[i], 'g'), i);
      }
      return result;
    }

    // ===== جستجوی سریع: متن‌های کوچک‌شده‌ی هر کتاب فقط یک‌بار ساخته می‌شود و عدد صفحات فقط یک‌بار در هر جستجو خوانده می‌شود =====
    const SEARCH_SINGLE_FIELDS = ['title', 'author', 'genre', 'publisher', 'translator'];
    const searchIdxCache = new WeakMap();
    function getSearchIdx(b) {
      let byLang = searchIdxCache.get(b);
      if (!byLang) { byLang = {}; searchIdxCache.set(b, byLang); }
      let idx = byLang[currentLang];
      if (!idx) {
        const lower = (f) => String((b[f] && b[f][currentLang]) || '').toLowerCase();
        idx = {};
        SEARCH_SINGLE_FIELDS.forEach(f => { idx[f] = lower(f); });
        // «جستجوی کلی»: پنج فیلد بالا + توضیحات؛ توضیحات فقط همین‌جا نگه داشته می‌شود تا حافظه دو برابر نشود
        idx.all = SEARCH_SINGLE_FIELDS.map(f => idx[f]).concat(lower('desc')).join('\n');
        byLang[currentLang] = idx;
      }
      return idx;
    }
    function makeBookMatcher(q, criteria) {
      if (!q) return () => true;
      if (criteria === 'pages') {
        // اگر ورودی با عدد شروع نشود (مثلاً فقط حروف)، عمداً هیچ کتابی مطابقت ندارد و پیام «پیدا نشد» نمایش داده می‌شود
        // (ورودی مثل «300 صفحه» همچنان عدد ۳۰۰ را می‌خواند)
        const parsed = parseInt(convertPersianDigitsToEnglish(q), 10);
        if (isNaN(parsed)) return () => false;
        return b => b.pages <= parsed;
      }
      const field = SEARCH_SINGLE_FIELDS.includes(criteria) ? criteria : 'all';
      return b => getSearchIdx(b)[field].includes(q);
    }

    // تایپ پشت‌سرهم فقط یک‌بار (۱۸۰ میلی‌ثانیه بعد از آخرین کلید) جستجو را اجرا می‌کند
    let liveSearchTimer = null;
    function debouncedLiveSearch() {
      clearTimeout(liveSearchTimer);
      liveSearchTimer = setTimeout(() => {
        handleLiveSearch(document.getElementById('searchInput').value);
      }, 180);
    }
    const SUGGESTION_LIMIT = 10;

    function handleLiveSearch(query) {
      const q = query.trim().toLowerCase();
      const criteria = document.getElementById('searchCriteria').value;
      const suggestionsBox = document.getElementById('searchSuggestionsBox');
      const t = translations[currentLang];

      if (!q) {
        hideSuggestions();
        handleSmartSearch();
        return;
      }

      const matched = books.filter(makeBookMatcher(q, criteria));

      suggestionsBox.style.display = 'block';

      if (matched.length === 0) {
        suggestionsBox.innerHTML = `
          <div class="suggestion-item empty">${t.notFoundText}</div>
        `;
      } else {
        suggestionsBox.innerHTML = matched.slice(0, SUGGESTION_LIMIT).map(b => `
          <div class="suggestion-item" onclick="selectSuggestion('${b.id}')">
            <span class="bk-sugg">${bookThumbHtml(b)}<span><strong>${b.title[currentLang]}</strong> <small style="color:var(--text-muted);">(${b.author[currentLang]})</small></span></span>
            <span class="genre-tag" style="pointer-events:none;">${b.genre[currentLang]}</span>
          </div>
        `).join('') + (matched.length > SUGGESTION_LIMIT
          ? `<div class="suggestion-item empty">${t.suggestMore}</div>` : '');
      }

      handleSmartSearch();
    }

    function selectSuggestion(bookId) {
      hideSuggestions();
      openBookBio(bookId);
    }

    function hideSuggestions() {
      const box = document.getElementById('searchSuggestionsBox');
      if (box) box.style.display = 'none';
    }

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.search-wrapper')) {
        hideSuggestions();
      }
    });

    function setViewMode(mode) {
      currentViewMode = mode;
      // صفحه‌ی اصلی از #booksCatalog استفاده می‌کنه، صفحه‌ی اختصاصی نویسنده از #authorBooksCatalog؛
      // هر صفحه فقط یکی از این دو رو داره، پس همیشه دقیقاً همون یکی پیدا و به‌روزرسانی می‌شه
      const catalog = document.getElementById('booksCatalog') || document.getElementById('authorBooksCatalog');
      const btnGrid = document.getElementById('btnViewGrid');
      const btnList = document.getElementById('btnViewList');

      if (mode === 'list') {
        catalog.classList.add('list-view');
        btnList.classList.add('active');
        btnGrid.classList.remove('active');
      } else {
        catalog.classList.remove('list-view');
        btnGrid.classList.add('active');
        btnList.classList.remove('active');
      }
    }

    function loadMoreFamousBooks() {
      const hasQuery = document.getElementById('searchInput').value.trim() !== '';
      if (!activeFilter && !hasQuery) {
        displayedCount += LOAD_STEP;
      } else {
        resultsLimit += RESULT_PAGE_SIZE;
      }
      handleSmartSearch();
    }

    function handleSmartSearch() {
      if (!document.getElementById('booksCatalog')) return; // این بخش فقط در صفحه‌ی اصلی وجود دارد
      const q = document.getElementById('searchInput').value.trim().toLowerCase();
      if (q) {
        try {
          let hist = safeReadStorage('pdf_market_search_history', [], 'array');
          hist = hist.filter(item => item !== q);
          hist.unshift(q);
          hist = hist.slice(0, 30); // فقط ۳۰ جست‌وجوی اخیر نگه‌داشته می‌شود
          localStorage.setItem('pdf_market_search_history', JSON.stringify(hist));
        } catch (e) { /* حافظه‌ی مرورگر پر یا غیرفعال است */ }
      }
      const criteria = document.getElementById('searchCriteria').value;
      const loadMoreDivider = document.getElementById('loadMoreDivider');

      let baseList = [...books];
      let sortMetric = null;

      if (activeFilter) {
        if (activeFilter.kind === 'entity') {
          baseList = baseList.filter(b => b[activeFilter.type][currentLang] === activeFilter.name);
        } else if (activeFilter.kind === 'genreGroup') {
          baseList = baseList.filter(b => b.genreGroup === activeFilter.groupKey);
        } else if (activeFilter.kind === 'category') {
          baseList = baseList.filter(b => b.category === activeFilter.categoryKey);
        } else if (activeFilter.kind === 'special') {
          if (activeFilter.type === 'bestsellerSite') sortMetric = 'salesSite';
          else if (activeFilter.type === 'bestsellerIran') sortMetric = 'salesIran';
          else if (activeFilter.type === 'bestsellerWorld') sortMetric = 'salesWorld';
          else if (activeFilter.type === 'discounted') sortMetric = 'totalPrice';

          if (sortMetric === 'totalPrice') {
            baseList.sort((a, b) => a[sortMetric] - b[sortMetric]);
          } else if (sortMetric) {
            baseList.sort((a, b) => b[sortMetric] - a[sortMetric]);
          }
        }
      }

      const filtered = baseList.filter(makeBookMatcher(q, criteria));

      // با عوض شدن فیلتر/جستجو/زبان، شمارنده‌ی «نمایش بیشتر» از اول شروع می‌شود
      const sig = JSON.stringify([activeFilter, q, criteria, currentLang]);
      if (sig !== lastResultsSig) { lastResultsSig = sig; resultsLimit = RESULT_PAGE_SIZE; }

      let booksToRender = filtered;
      if (!activeFilter && !q) {
        booksToRender = filtered.slice(0, displayedCount);
        if (displayedCount < filtered.length) {
          loadMoreDivider.style.display = 'flex';
        } else {
          loadMoreDivider.style.display = 'none';
        }
      } else {
        // نتایج فیلتر/جستجو هم صفحه‌به‌صفحه نمایش داده می‌شوند تا با هزاران کتاب صفحه سنگین نشود
        booksToRender = filtered.slice(0, resultsLimit);
        loadMoreDivider.style.display = resultsLimit < filtered.length ? 'flex' : 'none';
      }

      renderBooks(booksToRender, sortMetric);
    }

    // اعمال رنگ‌های CSS بدون هیچ اثر جانبی (مثل بستن کادر تم) — هم برای انتخاب دستی رنگ و هم برای هر تیک تم رنگین‌کمانی استفاده می‌شه
    function applyThemeVars(hexColor) {
      const c = hexColor.substring(1);
      const rgb = parseInt(c, 16);
      const r = (rgb >> 16) & 0xff;
      const g = (rgb >>  8) & 0xff;
      const b = (rgb >>  0) & 0xff;
      const brightness = 0.2126 * r + 0.7152 * g + 0.0722 * b;

      const isDark = brightness < 128;
      const root = document.documentElement;

      root.style.setProperty('--bg', hexColor);
      var tcMeta = document.querySelector('meta[name="theme-color"]'); if (tcMeta) tcMeta.setAttribute('content', hexColor);
      root.style.setProperty('--menu-bg', hexColor);

      // اگه کاربر از بخش «رنگ کادر» رنگ اختصاصی انتخاب کرده، --primary رو دست نزن
      // تا دکمه‌ها، لینک‌ها، لوگو و کادرهای رنگی با تغییر تم زمینه ثابت بمونن و جدا کنترل بشن
      const customFrame = localStorage.getItem('spotlight_cover_color');

      if (isDark) {
        root.style.setProperty('--text', '#f5f6fa');
        root.style.setProperty('--text-muted', '#cbd5e1');
        root.style.setProperty('--card-bg', 'rgba(255, 255, 255, 0.06)');
        root.style.setProperty('--border', 'rgba(255, 255, 255, 0.16)');
        root.style.setProperty('--accent', 'rgba(255, 255, 255, 0.09)');
        if (!customFrame) {
          root.style.setProperty('--primary', '#e84118');
          root.style.setProperty('--primary-hover', '#c23616');
        }
      } else {
        // زمینه‌ی روشنِ «رنگی» (پاستیلی پررنگ یا گرم): کارت‌ها کمی روشن‌تر تا خوانا بمانند و متن کم‌رنگ‌تر نشود.
        // زمینه‌ی گرم (کاغذی): متن قهوه‌ای تیره‌ی نرم، که از مشکیِ خالص برای چشم راحت‌تر است.
        const chroma = Math.max(r, g, b) - Math.min(r, g, b);
        const warm = r >= g && g >= b && (r - b) >= 22;
        if (warm) {
          root.style.setProperty('--text', '#3b2f23');
          root.style.setProperty('--text-muted', '#6b5a48');
          root.style.setProperty('--card-bg', 'rgba(255, 255, 255, 0.38)');
          root.style.setProperty('--border', 'rgba(90, 60, 20, 0.18)');
          root.style.setProperty('--accent', 'rgba(90, 60, 20, 0.08)');
        } else if (chroma >= 14) {
          root.style.setProperty('--text', '#2a3140');
          root.style.setProperty('--text-muted', '#566174');
          root.style.setProperty('--card-bg', 'rgba(255, 255, 255, 0.5)');
          root.style.setProperty('--border', 'rgba(0, 0, 0, 0.14)');
          root.style.setProperty('--accent', 'rgba(0, 0, 0, 0.07)');
        } else {
          root.style.setProperty('--text', '#2f3640');
          root.style.setProperty('--text-muted', '#718093');
          root.style.setProperty('--card-bg', 'rgba(0, 0, 0, 0.03)');
          root.style.setProperty('--border', 'rgba(0, 0, 0, 0.12)');
          root.style.setProperty('--accent', 'rgba(0, 0, 0, 0.05)');
        }
        if (!customFrame) {
          root.style.setProperty('--primary', '#c95c5c');
          root.style.setProperty('--primary-hover', '#b04949');
        }
      }
    }

    function applyFullTheme(hexColor) {
      applyThemeVars(hexColor);
      document.getElementById('bgGrid').classList.remove('show');
    }

    // رنگ‌های اختصاصیِ کادر «پیشنهاد تصادفی» (spotlight) — کاملاً جدا از پالت تم اصلی سایت.
    // رنگ‌های کادر حالا از روی رنگ زمینه‌ی تم فعلی ساخته می‌شن (هم‌خانواده، مکمل و سه‌گانه) تا همیشه با تم سایت بیان
    function hexToHsl(hex) {
      const n = parseInt(hex.substring(1), 16);
      const r = ((n >> 16) & 255) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
      const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
      let h = 0;
      if (d) {
        if (max === r) h = ((g - b) / d) % 6;
        else if (max === g) h = (b - r) / d + 2;
        else h = (r - g) / d + 4;
        h = (h * 60 + 360) % 360;
      }
      const l = (max + min) / 2;
      const s = d ? d / (1 - Math.abs(2 * l - 1)) : 0;
      return { h, s: s * 100, l: l * 100 };
    }

    function buildFrameColors(bgHex) {
      const { h, s, l } = hexToHsl(bgHex);
      const dark = l < 50;
      // زمینه‌ی تقریباً بی‌رنگ (سفید/خاکستری/مشکی): یه فام پایه‌ی ملایم بگیر تا باز هم تنوع داشته باشیم
      const base = s < 10 ? 18 : h;
      const H = d => (base + d + 360) % 360;
      // [اختلاف فام، اشباع، روشنی]
      const spec = dark ? [
        [0, 55, 58], [0, 45, 30], [0, 30, 20],
        [25, 65, 60], [-25, 60, 58], [50, 60, 60], [-50, 55, 58],
        [120, 50, 58], [-120, 50, 60], [180, 55, 58],
        [0, 70, 72], [30, 60, 72], [-30, 55, 72],
        [150, 40, 32], [210, 40, 32], [75, 40, 30]
      ] : [
        [0, 45, 38], [0, 55, 48], [0, 30, 26],
        [25, 50, 40], [-25, 50, 42], [50, 48, 42], [-50, 45, 40],
        [120, 40, 38], [-120, 42, 40], [180, 45, 38],
        [0, 55, 74], [30, 55, 76], [-30, 50, 76],
        [150, 38, 70], [210, 38, 72], [75, 40, 72]
      ];
      return spec.map(([dh, sat, lig]) => hslToHex(H(dh), sat, lig));
    }

    function getCurrentBgHex() {
      const bg = (getComputedStyle(document.documentElement).getPropertyValue('--bg') || '').trim();
      return /^#[0-9a-f]{6}$/i.test(bg) ? bg : '#faf6f0';
    }

    function fillFramePanel(framePanel) {
      framePanel.innerHTML = '';
      const savedSpotlightColor = localStorage.getItem('spotlight_cover_color');
      buildFrameColors(getCurrentBgHex()).forEach(color => {
        const dot = document.createElement('div');
        dot.className = 'spotlight-color-dot';
        dot.style.background = color;
        if (savedSpotlightColor && savedSpotlightColor.toLowerCase() === color.toLowerCase()) dot.classList.add('active');
        dot.onclick = () => {
          framePanel.querySelectorAll('.spotlight-color-dot').forEach(d => d.classList.remove('active'));
          dot.classList.add('active');
          applySpotlightCoverColor(color);
          localStorage.setItem('spotlight_cover_color', color);
        };
        framePanel.appendChild(dot);
      });
      const resetBtn = document.createElement('div');
      resetBtn.className = 'spotlight-reset-btn';
      resetBtn.textContent = translations[currentLang].themeResetFrame;
      resetBtn.title = translations[currentLang].themeResetFrameTip;
      resetBtn.onclick = () => {
        framePanel.querySelectorAll('.spotlight-color-dot').forEach(d => d.classList.remove('active'));
        resetSpotlightCoverColor();
      };
      framePanel.appendChild(resetBtn);
    }


    // پنل دکمه‌ی تم حالا دو تب کنار هم داره: «تم سایت» (پیش‌فرض، همون لحظه‌ی اول باز) و
    // «رنگ کادر» (فقط با کلیک روی تبش باز می‌شه)؛ دیگه رنگ کادر پایینِ لیست تم چسبیده نیست.
    function switchThemeTab(tab) {
      const siteTabBtn   = document.getElementById('themeTabSiteBtn');
      const frameTabBtn  = document.getElementById('themeTabFrameBtn');
      const sitePanel    = document.getElementById('themeTabSitePanel');
      const framePanel   = document.getElementById('themeTabFramePanel');
      if (!siteTabBtn || !frameTabBtn || !sitePanel || !framePanel) return;
      const isSite = tab === 'site';
      siteTabBtn.classList.toggle('active', isSite);
      frameTabBtn.classList.toggle('active', !isSite);
      sitePanel.classList.toggle('active', isSite);
      framePanel.classList.toggle('active', !isSite);
      if (!isSite) fillFramePanel(framePanel);
    }

    function initColors() {
      const grid = document.getElementById('bgGrid');
      grid.innerHTML = '';

      // ----- ردیف تب‌ها: «تم سایت» و «رنگ کادر»، کنار هم (نه زیر هم) -----
      const tabsRow = document.createElement('div');
      tabsRow.className = 'theme-tabs';

      const siteTabBtn = document.createElement('button');
      siteTabBtn.type = 'button';
      siteTabBtn.id = 'themeTabSiteBtn';
      siteTabBtn.className = 'theme-tab-btn active';
      siteTabBtn.textContent = translations[currentLang].themeTabSite;
      siteTabBtn.onclick = () => switchThemeTab('site');
      tabsRow.appendChild(siteTabBtn);

      const frameTabBtn = document.createElement('button');
      frameTabBtn.type = 'button';
      frameTabBtn.id = 'themeTabFrameBtn';
      frameTabBtn.className = 'theme-tab-btn';
      frameTabBtn.textContent = translations[currentLang].themeTabFrame;
      frameTabBtn.onclick = () => switchThemeTab('frame');
      tabsRow.appendChild(frameTabBtn);

      grid.appendChild(tabsRow);

      // ----- تب اول (پیش‌فرض، باز): رنگ‌های ظاهر/تم سایت -----
      const sitePanel = document.createElement('div');
      sitePanel.id = 'themeTabSitePanel';
      sitePanel.className = 'theme-tab-panel active';

      // نوار اول: تم رنگین‌کمانی تیره؛ نوار دوم درست زیرش: تم رنگین‌کمانی پاستیلی (از بالا به پایین پشت‌سرهم)
      const darkBar = document.createElement('div');
      darkBar.className = 'theme-cycle-bar dark-cycle';
      darkBar.textContent = translations[currentLang].themeDarkRainbow;
      darkBar.title = translations[currentLang].themeDarkRainbowTip;
      darkBar.onclick = () => toggleRainbowTheme('dark', darkBar);
      sitePanel.appendChild(darkBar);

      const pastelBar = document.createElement('div');
      pastelBar.className = 'theme-cycle-bar pastel-cycle';
      pastelBar.textContent = translations[currentLang].themePastelRainbow;
      pastelBar.title = translations[currentLang].themePastelRainbowTip;
      pastelBar.onclick = () => toggleRainbowTheme('pastel', pastelBar);
      sitePanel.appendChild(pastelBar);

      // اگه در همین لحظه (مثلاً بعد از رفرش صفحه) یکی از دو حالت رنگین‌کمانی از قبل روشنه،
      // نوار مربوطه رو بلافاصله بعد از ساختش «فعال» نشون بده.
      if (rainbowMode === 'dark') darkBar.classList.add('active');
      if (rainbowMode === 'pastel') pastelBar.classList.add('active');

      allColors.forEach(color => {
        const dot = document.createElement('div');
        dot.className = 'circle-dot';
        dot.style.background = color;
        dot.onclick = () => {
          stopRainbowTheme();
          applyFullTheme(color);
          // انتخاب دستی کاربر ذخیره می‌شه تا تغییر خودکار روز/شب دیگه روش دست نذاره
          localStorage.setItem('theme_manual_override', color);
        };
        sitePanel.appendChild(dot);
      });

      grid.appendChild(sitePanel);

      // ----- تب دوم (فقط با کلیک باز می‌شه): رنگ کادر «پیشنهاد تصادفی» (همون کادر «انسان در جستجوی معنی» و امثالش) -----
      const framePanel = document.createElement('div');
      framePanel.id = 'themeTabFramePanel';
      framePanel.className = 'theme-tab-panel';

      fillFramePanel(framePanel);

      grid.appendChild(framePanel);
    }

    // محاسبه‌ی رنگ متن مناسب (سفید یا تیره) بر اساس روشنیِ پس‌زمینه، و اعمال هر دو متغیر CSS
    // کم‌رنگ‌تر کردن یک رنگ هگز برای حالت hover دکمه‌ها
    function darkenHexForHover(hex, amount) {
      const c = hex.substring(1);
      const rgb = parseInt(c, 16);
      let r = (rgb >> 16) & 0xff, g = (rgb >> 8) & 0xff, b = rgb & 0xff;
      r = Math.max(0, Math.round(r * (1 - amount)));
      g = Math.max(0, Math.round(g * (1 - amount)));
      b = Math.max(0, Math.round(b * (1 - amount)));
      return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
    }

    // رنگ کادر: روی کادر پیشنهاد تصادفی + تمام بخش‌هایی که با --primary رنگ می‌گیرن
    // (دکمه‌ها، لینک‌ها، لوگو، بج‌ها، حاشیه‌های رنگی و …) اعمال می‌شه تا با عوض کردن تم زمینه ثابت بمونن
    function applySpotlightCoverColor(hexColor) {
      const c = hexColor.substring(1);
      const rgb = parseInt(c, 16);
      const r = (rgb >> 16) & 0xff, g = (rgb >> 8) & 0xff, b = rgb & 0xff;
      const brightness = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      const root = document.documentElement;
      root.style.setProperty('--spotlight-cover-bg', hexColor);
      root.style.setProperty('--spotlight-cover-text', brightness < 128 ? '#f5f6fa' : '#2f3640');
      // همه المان‌هایی که قبلاً با تغییر تم ثابت می‌موندن (primary)
      root.style.setProperty('--primary', hexColor);
      root.style.setProperty('--primary-hover', darkenHexForHover(hexColor, 0.15));
    }

    // بازگشت رنگ کادر/دکمه‌ها به پیش‌فرض تم (قرمز تیره یا مرجانی بسته به روشن/تیره بودن زمینه)
    function resetSpotlightCoverColor() {
      const root = document.documentElement;
      root.style.removeProperty('--spotlight-cover-bg');
      root.style.removeProperty('--spotlight-cover-text');
      localStorage.removeItem('spotlight_cover_color');
      // primary رو دوباره بر اساس روشنیِ تم فعلی ست کن
      try {
        const bg = (getComputedStyle(root).getPropertyValue('--bg') || '#faf6f0').trim() || '#faf6f0';
        const hx = bg.charAt(0) === '#' ? bg : '#faf6f0';
        const c = hx.substring(1);
        const rgb = parseInt(c, 16);
        const r = (rgb >> 16) & 0xff, g = (rgb >> 8) & 0xff, b = rgb & 0xff;
        const isDark = (0.2126 * r + 0.7152 * g + 0.0722 * b) < 128;
        if (isDark) {
          root.style.setProperty('--primary', '#e84118');
          root.style.setProperty('--primary-hover', '#c23616');
        } else {
          root.style.setProperty('--primary', '#c95c5c');
          root.style.setProperty('--primary-hover', '#b04949');
        }
      } catch (e) {
        root.style.setProperty('--primary', '#c95c5c');
        root.style.setProperty('--primary-hover', '#b04949');
      }
    }

    // با هر بارگذاری صفحه، اگه کاربر قبلاً رنگ اختصاصی برای کادر پیشنهادی انتخاب کرده، همون رو برگردون
    function applySavedSpotlightColor() {
      const saved = localStorage.getItem('spotlight_cover_color');
      if (saved) applySpotlightCoverColor(saved);
    }

    // موقعیت‌دهی جعبه‌ی تم‌های رنگی؛ روی موبایل به‌جای چسبیدن به لبه‌ی دکمه، دقیقاً زیر دکمه باز می‌شه (چپ‌چین با CSS)
    function toggleColorGrid() {
      const grid = document.getElementById('bgGrid');
      const willShow = !grid.classList.contains('show');
      grid.classList.toggle('show');
      // هر بار که پنل از نو باز می‌شه، همیشه اول تبِ «تم سایت» نشون داده بشه، نه هر تبی که آخرین بار باز بوده
      if (willShow) switchThemeTab('site');
      if (willShow && window.matchMedia('(max-width: 680px)').matches) {
        const btn = document.getElementById('colorPickerBtn');
        const rect = btn.getBoundingClientRect();
        grid.style.top = (rect.bottom + 8) + 'px';
      } else {
        grid.style.top = '';
      }
    }

    // ----- تم رنگین‌کمانی: رنگ زمینه‌ی سایت پیوسته در طیف رنگ‌ها می‌چرخه (تیره یا پاستیلی)، و دوباره از اول تکرار می‌شه -----
    // نکته‌ی مهم: تیک‌های خودکار چرخش فقط applyThemeVars صدا می‌زنن (نه applyFullTheme)، وگرنه هر ۳۵۰ میلی‌ثانیه
    // کادر تم رو می‌بستن و کاربر اصلاً فرصت نمی‌کرد رنگ دیگه‌ای انتخاب کنه.
    let rainbowIntervalId = null;
    let rainbowMode = null; // 'dark' | 'pastel' | null

    function hslToHex(h, s, l) {
      s /= 100; l /= 100;
      const k = n => (n + h / 30) % 12;
      const a = s * Math.min(l, 1 - l);
      const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
      const toHex = x => Math.round(255 * x).toString(16).padStart(2, '0');
      return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
    }

    function stopRainbowTheme() {
      if (rainbowIntervalId) {
        clearInterval(rainbowIntervalId);
        rainbowIntervalId = null;
      }
      rainbowMode = null;
      document.querySelectorAll('.theme-cycle-bar').forEach(b => b.classList.remove('active'));
    }

    // هسته‌ی مشترک شروع چرخش رنگین‌کمانی؛ هم موقع کلیک کاربر روی نوار استفاده می‌شه،
    // هم موقع بارگذاری صفحه (برای برگردوندن حالتی که کاربر قبلاً انتخاب کرده بود).
    function startRainbowTheme(mode) {
      stopRainbowTheme();
      rainbowMode = mode;
      const activeClassName = mode === 'dark' ? 'dark-cycle' : 'pastel-cycle';
      const barEl = document.querySelector('.theme-cycle-bar.' + activeClassName);
      if (barEl) barEl.classList.add('active');
      let hue = 210; // شروع از آبی
      const isDark = mode === 'dark';
      const step = () => {
        hue = (hue + 3) % 360;
        const hex = isDark ? hslToHex(hue, 55, 20) : hslToHex(hue, 68, 76);
        applyThemeVars(hex);
      };
      step();
      rainbowIntervalId = setInterval(step, 350);
    }

    function toggleRainbowTheme(mode, barEl) {
      // اگه همین حالت از قبل فعاله، با کلیک دوباره خاموشش کن
      if (rainbowMode === mode) {
        stopRainbowTheme();
        localStorage.removeItem('theme_manual_override');
        document.getElementById('bgGrid').classList.remove('show');
        return;
      }
      startRainbowTheme(mode);
      // انتخاب رنگین‌کمانی هم مثل انتخاب رنگ ثابت باید ذخیره بشه، وگرنه با رفرش صفحه
      // (چون هیچ چیزی در localStorage نبود) دوباره یه تم ثابتِ تصادفی جایگزینش می‌شد.
      localStorage.setItem('theme_manual_override', mode === 'dark' ? 'rainbow-dark' : 'rainbow-pastel');
      document.getElementById('bgGrid').classList.remove('show');
    }


    function toggleMenu(menuId) {
      const target = document.getElementById(menuId);
      target.classList.toggle('show');
    }

    // ===== سوییچ اختصاصی «نسخه رایانه‌ای» سایت =====
    // این سوییچ کاملاً مستقل از تنظیم «Desktop site» خودِ مرورگره؛ فقط با تغییر عرض گزارش‌شده‌ی
    // صفحه (viewport) به کاربر، همون چیدمان ۵ستونه/دسکتاپی رو نشون می‌ده که سایت برای صفحه‌های
    // پهن (بالای ۷۶۸px) داره. چون انتخاب کاربر در localStorage ذخیره می‌شه، با رفرش، بستن تب یا
    // حتی روزهای بعد هم از بین نمی‌ره؛ روی خط اول <head> هم زودتر از رندر بقیه‌ی صفحه اعمال می‌شه
    // تا هیچ پرش/فلاشی در ظاهر صفحه دیده نشه.
    // فقط برای همین بازدید (تا بستن تب/مرورگر) نگه داشته می‌شود؛ دفعه‌ی بعد سایت دوباره با ظاهر موبایل باز می‌شود
    const FORCE_DESKTOP_KEY = 'pdf_market_force_desktop_mode';

    function isForceDesktopModeOn() {
      try { return sessionStorage.getItem(FORCE_DESKTOP_KEY) === '1'; } catch (e) { return false; }
    }

    function applyForceDesktopMode(enabled) {
      const meta = document.getElementById('viewportMeta');
      if (enabled) {
        meta.setAttribute('content', 'width=980');
        document.documentElement.classList.add('force-desktop-mode');
      } else {
        meta.setAttribute('content', 'width=device-width, initial-scale=1.0, viewport-fit=cover');
        document.documentElement.classList.remove('force-desktop-mode');
      }
      syncDesktopModeButtons(enabled);
      syncDesktopUIClass();
    }
    window.addEventListener('resize', () => { syncDesktopUIClass(); });

    function syncDesktopModeButtons(enabled) {
      const t = translations[currentLang];
      const headerBtn = document.getElementById('desktopModeBtn');
      if (headerBtn) {
        headerBtn.classList.toggle('active', enabled);
        headerBtn.title = enabled ? t.btnDesktopModeOff : t.btnDesktopModeOn;
      }
    }

    function toggleForceDesktopMode() {
      const next = !isForceDesktopModeOn();
      try { sessionStorage.setItem(FORCE_DESKTOP_KEY, next ? '1' : '0'); } catch (e) {}
      applyForceDesktopMode(next);
      closeDrawer();
      // بعضی مرورگرهای موبایل تغییر زنده‌ی متای viewport را نادیده می‌گیرند (دکمه «کار نمی‌کند»)؛
      // با بارگذاری دوباره، انتخاب کاربر قبل از رندر (در <head>) اعمال می‌شود و همه‌جا مطمئن کار می‌کند.
      setTimeout(() => { try { location.reload(); } catch (e) {} }, 80);
    }

    // به‌روزرسانی متن‌های ثابت صفحه‌ی اختصاصی نویسنده هنگام تغییر زبان
    function updateAuthorPageLanguage() {
      const grid = document.getElementById('authorBooksCatalog');
      if (!grid) return;
      const pageAuthorId = grid.dataset.authorId;
      const a = authors.find(x => x.id === pageAuthorId);
      if (!a) return;
      const t = translations[currentLang];
      const isEn = currentLang === 'en';

      const nameEl = document.getElementById('authorPageName');
      if (nameEl) nameEl.textContent = a.name[currentLang];

      const setLabelVal = (labelSel, valId, labelText, valText) => {
        const row = document.getElementById(labelSel);
        if (!row) return;
        const strong = row.querySelector('strong');
        if (strong) strong.textContent = labelText;
        const val = document.getElementById(valId);
        if (val) val.textContent = valText;
      };

      const lifespanVal = a.deathYear
        ? `${a.birthYear} – ${a.deathYear}`
        : `${a.birthYear} – ${t.authorAliveSuffix || (isEn ? '(present)' : '(هم‌اکنون)')}`;
      setLabelVal('authorPageLifespan', 'authorPageLifespanVal',
        (t.authorLifespanLabel || (isEn ? 'Born – Died' : 'سال تولد – وفات')) + ':', lifespanVal);
      setLabelVal('authorPageNationality', 'authorPageNationalityVal',
        (t.authorNationalityLabel || (isEn ? 'Nationality' : 'ملیت')) + ':', a.nationality[currentLang]);
      setLabelVal('authorPageGenre', 'authorPageGenreVal',
        (t.authorGenreLabel || (isEn ? 'Literary Genre & Style' : 'سبک و ژانر ادبی')) + ':', a.genre[currentLang]);

      const bioSummary = document.getElementById('authorBioSummary');
      if (bioSummary) {
        bioSummary.textContent = isEn
          ? `📖 Biography of ${a.name.en}`
          : `📖 زندگی‌نامه ${a.name.fa}`;
      }
      const bioEl = document.getElementById('authorPageBio');
      if (bioEl && a.bio) bioEl.innerHTML = formatBioHtml(a.bio[currentLang]);

      const roSummary = document.getElementById('authorReadingOrderSummary');
      const roBody = document.getElementById('authorReadingOrderBody');
      if (a.readingOrder && a.readingOrder[currentLang]) {
        if (roSummary) roSummary.textContent = a.readingOrder[currentLang].summary;
        if (roBody) roBody.innerHTML = a.readingOrder[currentLang].body;
      }

      const crumbHome = document.getElementById('authorBreadcrumbHome');
      if (crumbHome) crumbHome.textContent = isEn ? 'PDF Market' : 'PDF مارکت';
      const crumbNav = document.getElementById('authorBreadcrumb');
      if (crumbNav) crumbNav.setAttribute('aria-label', isEn ? 'Breadcrumb' : 'مسیر صفحه');
      const crumbCur = document.getElementById('authorBreadcrumbCurrent');
      if (crumbCur) crumbCur.textContent = a.name[currentLang];
      const photoEl = document.getElementById('authorPagePhoto');
      if (photoEl) photoEl.alt = isEn ? ('Photo of ' + a.name.en + ', author') : ('عکس ' + a.name.fa + '، نویسنده');

      const heading = document.getElementById('authorBooksHeading');
      if (heading) {
        const authorBooks = books.filter(b => b.authorId === pageAuthorId);
        heading.textContent = `${t.authorBooksHeadingPrefix || (isEn ? '📚 Books by' : '📚 کتاب‌های')} ${a.name[currentLang]}`;
      }

      // عنوان صفحه و meta description برای SEO
      if (isEn) {
        document.title = a.readingOrder
          ? `${a.name.en} | Full Biography, Reading Order & PDF Books | PDF Market`
          : `${a.name.en} | Full Biography & PDF Books | PDF Market`;
      } else {
        document.title = a.readingOrder
          ? `${a.name.fa} | بیوگرافی کامل، ترتیب مطالعه و کتاب‌های PDF | PDF مارکت`
          : `${a.name.fa} | بیوگرافی کامل و کتاب‌های PDF | PDF مارکت`;
      }

      // رندر مجدد کارت‌های کتاب با زبان جدید
      const authorBooks = books.filter(b => b.authorId === pageAuthorId);
      grid.innerHTML = authorBooks.length
        ? authorBooks.map(b => buildBookCardHtml(b)).join('')
        : `<p style="grid-column: 1/-1; text-align:center; padding:20px; color:var(--text-muted);">${t.authorNoBooksText || (isEn ? 'No books from this author yet.' : 'فعلاً کتابی از این نویسنده ثبت نشده است.')}</p>`;
    }

    function toggleLanguage() {
      currentLang = currentLang === 'fa' ? 'en' : 'fa';
      const isEn = currentLang === 'en';
      const t = translations[currentLang];

      // اگر کاربر وارد حساب کاربری شده، انتخاب زبان جدید برای دفعات بعد هم ذخیره می‌شود
      // تا وقتی خودش دوباره عوضش نکند، دیگر لازم نیست هر بار زبان را دستی تنظیم کند
      if (currentActiveUser && !window.__langBoot) {
        currentActiveUser.preferredLang = currentLang;
        localStorage.setItem('pdf_market_active_session', JSON.stringify(currentActiveUser));
        const usersForLang = getUsersDatabase();
        const langUIdx = usersForLang.findIndex(u => u.phone === currentActiveUser.phone);
        if (langUIdx !== -1) {
          usersForLang[langUIdx].preferredLang = currentLang;
          saveUsersDatabase(usersForLang);
        }
      }

      document.body.classList.toggle('en-mode', isEn);
      document.documentElement.lang = currentLang;
      document.documentElement.dir = isEn ? 'ltr' : 'rtl';

      const langBtnEl = document.getElementById('langBtn');
      if (langBtnEl) langBtnEl.textContent = t.langBtn;
      if (document.getElementById('authLangBtn')) document.getElementById('authLangBtn').textContent = t.langBtn;
      syncDesktopModeButtons(isForceDesktopModeOn());
      const brandLogoEl = document.getElementById('brandLogo');
      if (brandLogoEl) brandLogoEl.innerHTML = `${t.logoBrand}<span>${t.logoAccent}</span>`;

      // دکمه‌های اسلایدر فقط روی صفحه‌ی اصلی وجود دارند؛ روی صفحه‌ی نویسنده null هستند
      const setTxt = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };
      if (isEn) {
        setTxt('spotPrevBtn', '‹');
        setTxt('spotNextBtn', '›');
        setTxt('trainPrevBtn', '‹');
        setTxt('trainNextBtn', '›');
      } else {
        setTxt('spotPrevBtn', '›');
        setTxt('spotNextBtn', '‹');
        setTxt('trainPrevBtn', '›');
        setTxt('trainNextBtn', '‹');
      }

      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) {
          el.innerHTML = t[key];
        }
      });

      // عنوان‌های راهنما (tooltip) و placeholderهایی که کلید ترجمه دارند
      document.querySelectorAll('[data-i18n-title]').forEach(el => {
        const key = el.getAttribute('data-i18n-title');
        if (t[key]) el.title = t[key];
      });
      document.querySelectorAll('[data-i18n-ph]').forEach(el => {
        const key = el.getAttribute('data-i18n-ph');
        if (t[key]) el.placeholder = t[key];
      });

      // به‌روزرسانی محتوای ثابت صفحه‌ی اختصاصی نویسنده (بیوگرافی، ترتیب مطالعه، عنوان‌ها)
      updateAuthorPageLanguage();

      if (isEn) {
        document.getElementById('askName').placeholder = 'Full Name';
        document.getElementById('askContact').placeholder = 'Email or Mobile Number';
        document.getElementById('askMessage').placeholder = 'Write your question...';
        document.getElementById('loginUsername').placeholder = 'Username or Mobile';
        document.getElementById('loginPassword').placeholder = 'Password';
        document.getElementById('regPhone').placeholder = 'Mobile (Only once per number)';
        document.getElementById('regUsername').placeholder = 'Desired Username';
        document.getElementById('regPassword').placeholder = 'Password (numbers only, min. 6 digits)';
        if (document.getElementById('regReferralCodeInput')) {
          document.getElementById('regReferralCodeInput').placeholder = 'Referral Code (Optional)';
        }
        if (document.getElementById('phoneVerifyOtpInput')) {
          document.getElementById('phoneVerifyOtpInput').placeholder = '4-digit SMS OTP';
        }
        if (document.getElementById('readingDateSpecificInput')) {
          document.getElementById('readingDateSpecificInput').placeholder = 'MM/DD/YYYY';
        }
        if (document.getElementById('shelfSearchInput')) {
          document.getElementById('shelfSearchInput').placeholder = 'Search books...';
        }
        if (document.getElementById('cartVoucherInput')) {
          document.getElementById('cartVoucherInput').placeholder = 'Enter discount code...';
        }
        if (document.getElementById('forgotPhone')) {
          document.getElementById('forgotPhone').placeholder = 'Registered Mobile Number';
        }
        if (document.getElementById('forgotOtpInput')) {
          document.getElementById('forgotOtpInput').placeholder = 'SMS Code';
        }
        if (document.getElementById('forgotNewPassword')) {
          document.getElementById('forgotNewPassword').placeholder = 'New Password (numbers only, min. 6 digits)';
        }
        if (document.getElementById('changeUserOtpInput')) {
          document.getElementById('changeUserOtpInput').placeholder = 'SMS Code';
        }
        if (document.getElementById('changeUserNewUsernameInput')) {
          document.getElementById('changeUserNewUsernameInput').placeholder = 'New Username';
        }
        if (document.getElementById('feedbackMessage')) {
          document.getElementById('feedbackMessage').placeholder = 'Write your comments and suggestions...';
        }
      } else {
        document.getElementById('askName').placeholder = 'نام و نام خانوادگی';
        document.getElementById('askContact').placeholder = 'ایمیل یا شماره همراه جهت دریافت پاسخ';
        document.getElementById('askMessage').placeholder = 'متن سوال شما...';
        document.getElementById('loginUsername').placeholder = 'نام کاربری یا شماره همراه';
        document.getElementById('loginPassword').placeholder = 'رمز عبور';
        document.getElementById('regPhone').placeholder = 'شماره همراه (هر شماره فقط ۱ بار)';
        document.getElementById('regUsername').placeholder = 'نام کاربری دلخواه';
        document.getElementById('regPassword').placeholder = 'رمز عبور دلخواه (فقط عدد، حداقل ۶ رقم)';
        if (document.getElementById('regReferralCodeInput')) {
          document.getElementById('regReferralCodeInput').placeholder = 'کد معرف (اختیاری)';
        }
        if (document.getElementById('phoneVerifyOtpInput')) {
          document.getElementById('phoneVerifyOtpInput').placeholder = 'کد ۴ رقمی پیامک‌شده';
        }
        if (document.getElementById('readingDateSpecificInput')) {
          document.getElementById('readingDateSpecificInput').placeholder = '۱۴۰۳/۰۶/۲۷';
        }
        if (document.getElementById('shelfSearchInput')) {
          document.getElementById('shelfSearchInput').placeholder = 'جستجو در کتاب‌ها...';
        }
        if (document.getElementById('cartVoucherInput')) {
          document.getElementById('cartVoucherInput').placeholder = 'کد تخفیف خود را وارد کنید...';
        }
        if (document.getElementById('forgotPhone')) {
          document.getElementById('forgotPhone').placeholder = 'شماره همراه ثبت‌شده در سایت';
        }
        if (document.getElementById('forgotOtpInput')) {
          document.getElementById('forgotOtpInput').placeholder = 'کد پیامک‌شده';
        }
        if (document.getElementById('forgotNewPassword')) {
          document.getElementById('forgotNewPassword').placeholder = 'رمز عبور جدید (فقط عدد، حداقل ۶ رقم)';
        }
        if (document.getElementById('changeUserOtpInput')) {
          document.getElementById('changeUserOtpInput').placeholder = 'کد پیامک‌شده';
        }
        if (document.getElementById('changeUserNewUsernameInput')) {
          document.getElementById('changeUserNewUsernameInput').placeholder = 'نام کاربری جدید';
        }
        if (document.getElementById('feedbackMessage')) {
          document.getElementById('feedbackMessage').placeholder = 'نظرات، پیشنهادات و انتقادات شما درباره عملکرد فروشگاه و پنل کاربری...';
        }
      }

      populateDrawer();
      updateSavedBooksBadge();
      if (document.getElementById('booksCatalog')) {
        renderFeaturedTrain();
      }
      initUserAuthState();

      const searchInputEl = document.getElementById('searchInput');
      const activeFilterTextEl = document.getElementById('activeFilterText');

      if (activeFilter && searchInputEl) {
        if (activeFilter.kind === 'entity') {
          // نام فیلتر به زبان جدید برگردانده می‌شود (از روی خود کتاب‌ها، تا نویسنده/ناشر/مترجم‌های غیرویژه هم پوشش داده شوند)
          const srcBook = books.find(b => b[activeFilter.type] && (b[activeFilter.type].fa === activeFilter.name || b[activeFilter.type].en === activeFilter.name));
          if (srcBook) {
            activeFilter.name = srcBook[activeFilter.type][currentLang];
          } else {
            // اگر هنوز کتابی برای این ناشر/نویسنده نیست (مثل کارت‌های اسلایدر)، از خود اسلایدر ترجمه می‌شود
            const srcEntity = featuredEntities.find(e => e.type === activeFilter.type && [e.name, e.filterName].some(n => n && (n.fa === activeFilter.name || n.en === activeFilter.name)));
            if (srcEntity) activeFilter.name = (srcEntity.filterName || srcEntity.name)[currentLang];
          }
          if (activeFilterTextEl) activeFilterTextEl.textContent = `${t.filterPrefix}${activeFilter.name}`;
          searchInputEl.placeholder = `${t.searchInFilterPrefix} "${activeFilter.name}"...`;
        } else if (activeFilter.kind === 'genreGroup') {
          const groupLabel = GENRE_GROUPS[activeFilter.groupKey][currentLang];
          if (activeFilterTextEl) activeFilterTextEl.textContent = `${t.filterPrefix}${groupLabel}`;
          searchInputEl.placeholder = `${t.searchInGenrePrefix}"${groupLabel}"...`;
        } else if (activeFilter.kind === 'category') {
          const catKeyMap = {
            literature: 'catLiterature',
            history: 'catHistory',
            fiction: 'catFiction',
            psychology: 'catPsychology',
            success: 'catSuccess',
            philosophy: 'catPhilosophy'
          };
          const label = t[catKeyMap[activeFilter.categoryKey]] || activeFilter.categoryKey;
          if (activeFilterTextEl) activeFilterTextEl.textContent = `${t.filterPrefix}${label}`;
          searchInputEl.placeholder = `${t.searchInGenrePrefix}"${label}"...`;
        } else {
          let label = '';
          if (activeFilter.type === 'bestsellerSite') label = t.menuBestSite;
          else if (activeFilter.type === 'bestsellerIran') label = t.menuBestIran;
          else if (activeFilter.type === 'bestsellerWorld') label = t.menuBestWorld;
          else if (activeFilter.type === 'discounted') label = t.menuDiscounted;

          if (activeFilterTextEl) activeFilterTextEl.textContent = `${t.filterPrefix}${label}`;
          searchInputEl.placeholder = `${t.searchInBestPrefix}${label}...`;
        }
      } else if (searchInputEl) {
        searchInputEl.placeholder = t.searchPlaceholder;
      }

      // فقط روی صفحه‌ی اصلی (نه صفحه‌ی نویسنده)
      if (document.getElementById('booksCatalog')) {
        handleSmartSearch();
        updateSpotlight();
      }
      refreshDocTitle();
      applyThemePanelLanguage();

      // مودال‌هایی که در لحظه‌ی تغییر زبان باز هستند هم دوباره رندر شوند
      if (document.getElementById('cartModal') && document.getElementById('cartModal').style.display === 'flex') renderCartModalContent();
      if (document.getElementById('savedBooksModal') && document.getElementById('savedBooksModal').style.display === 'flex') openSavedBooksModal();
      if (document.getElementById('walletTransactionsModal') && document.getElementById('walletTransactionsModal').style.display === 'flex') renderAdvancedTransactions();
      if (document.getElementById('authorProfileModal') && document.getElementById('authorProfileModal').style.display === 'flex' && currentAuthorProfileId) openAuthorProfile(currentAuthorProfileId);
    }

    // اسم فایل صفحه‌ی مستقل کتاب (هم‌قاعده با book_page_file در lib.php)
    function bookPageFile(b, lang) {
      let s = String((b.title && b.title.en) || '').toLowerCase().replace(/['’‘]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      if (s.length > 60) s = s.substring(0, 60).replace(/-+$/g, '');
      const id = String(b.id || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      return (lang === 'en' ? 'en-book-' : 'book-') + id + (s ? '-' + s : '') + '.html';
    }

    // دکمه‌های کارت کتاب. در صفحه‌ی نویسنده فقط «ادامه برای خرید کتاب» (لینک واقعی به صفحه‌ی خود کتاب) و «مشخصات» می‌ماند؛
    // ذخیره / مطالعه‌ی نمونه / خرید داخل صفحه‌ی خود کتاب هستند. بقیه‌ی صفحه‌ها (صفحه‌ی اصلی) مثل قبل.
    function bookCardActionsHtml(b, t, saveBtnText) {
      if (document.getElementById('authorBooksCatalog')) {
        const label = currentLang === 'en' ? 'Continue to buy' : 'ادامه برای خرید کتاب';
        return `<div class="card-actions">
            <button class="btn-info" onclick="openBookBio('${b.id}')">${t.btnDetails}</button>
            <a class="btn-buy book-continue-btn" href="${bookPageFile(b, currentLang)}">${label}</a>
          </div>`;
      }
      return `<div class="card-actions">
            <button class="btn-info" onclick="openBookBio('${b.id}')">${t.btnDetails}</button>
            <button class="btn-read" onclick="toggleSaveBook('${b.id}')">${saveBtnText}</button>
            <button class="btn-read" onclick="openReader('${b.id}')">${t.btnRead}</button>
            <button class="btn-buy" onclick="addToCart('${b.id}')">${t.btnBuy}</button>
          </div>`;
    }

    // صفحه‌ی مستقل کتاب (#bookProduct): برچسب دکمه‌ی «ذخیره» با وضعیت ذخیره‌ی کاربر هماهنگ می‌شود
    function refreshBookSaveBtn() {
      const root = document.getElementById('bookProduct');
      const btn = document.getElementById('bookSaveBtn');
      if (!root || !btn) return;
      const t = translations[currentLang];
      btn.textContent = savedBookIds.includes(root.dataset.bookId) ? t.btnSaved : t.btnSaveForLater;
    }

    // یک کارت کتاب می‌سازد؛ هم توسط renderBooks (گرید اصلی/نتایج جستجو) و هم پنجره پروفایل نویسنده استفاده می‌شود
    function buildBookCardHtml(b, rankHtml = '') {
      const t = translations[currentLang];
      const isSaved = savedBookIds.includes(b.id);
      const saveBtnText = isSaved ? t.btnSaved : t.btnSaveForLater;
      const authorHtml = b.authorId
        ? authorLinkHtml(b.authorId, b.author[currentLang])
        : `<strong>${b.author[currentLang]}</strong>`;

      return `
        <div class="book-card">
          <div>
            ${rankHtml}
            <div class="book-head-row">
              <div class="bk-head-main">${bookThumbHtml(b)}<h3>${b.title[currentLang]}</h3></div>
              <span class="badge">${b.pages} ${t.pagesUnit}</span>
            </div>
            <div class="book-details">
              <span>${t.authorLabel}: ${authorHtml}</span>
              <div style="display:flex; gap:6px; align-items:center; flex-wrap:wrap; margin-top:2px;">
                <span class="genre-tag" data-v="${b.genreGroup}" onclick="filterByGenreGroup(this.dataset.v)">🏷️ ${b.genre[currentLang]}</span>
              </div>
              <span>${t.publisherLabel}: ${b.publisher[currentLang]}</span>
              <span>${t.translatorLabel}: ${b.translator[currentLang]}</span>
            </div>
          </div>

          <div class="price-box-simple">
            <span class="price-label">${t.finalTotalPriceLabel}</span>
            <span class="price-val">${dealPriceHtml(b, t)}</span>
          </div>

          ${bookCardActionsHtml(b, t, saveBtnText)}
        </div>
      `;
    }

    function renderBooks(list, sortMetric = null) {
      const t = translations[currentLang];
      const grid = document.getElementById('booksCatalog');
      grid.innerHTML = '';

      if (list.length === 0) {
        grid.innerHTML = `<p style="grid-column: 1/-1; text-align:center; padding:30px; color:var(--text-muted); font-size: 1.05rem; font-weight:700;">${t.notFoundText}</p>`;
        return;
      }

      const chunks = list.map((b, index) => {   // یک‌بار ساخته و یک‌بار در DOM گذاشته می‌شود (قبلاً هر کارت کل لیست را دوباره پارس می‌کرد)
        let rankHtml = '';
        if (sortMetric) {
          let unit = '';
          if (sortMetric === 'salesSite') unit = t.salesSiteUnit;
          else if (sortMetric === 'salesIran') unit = t.salesIranUnit;
          else if (sortMetric === 'salesWorld') unit = t.salesWorldUnit;

          rankHtml = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
              <span class="rank-badge">🏆 #${index+1}</span>
              <span style="font-size:0.78rem; color:var(--primary); font-weight:700;">${t.salesPrefix} ${b[sortMetric].toLocaleString()} ${unit}</span>
            </div>
          `;
        }
        return buildBookCardHtml(b, rankHtml);
      });
      grid.innerHTML = chunks.join('');
    }

    // ---- عکس جلد کتاب: اگه ادمین عکس جلد آپلود کرده باشه همه‌جا همون، وگرنه اسم کتاب تایپ می‌شه ----
    function bookThumbHtml(b) {
      const name = escapeHtml(b.title[currentLang] || b.title.fa || '');
      if (b.cover) return `<img class="bk-thumb" src="${escapeHtml(b.cover)}" alt="${name}" loading="lazy" decoding="async">`;
      return `<span class="bk-thumb bk-thumb-text" aria-hidden="true">${name}</span>`;
    }
    function setCoverBox(box, b) {
      if (!box) return;
      let img = box.querySelector('img.bk-cover-fill');
      if (b.cover) {
        if (!img) {
          img = document.createElement('img');
          img.className = 'bk-cover-fill';
          img.decoding = 'async';
          box.insertBefore(img, box.firstChild);
        }
        img.src = b.cover;
        img.alt = b.title[currentLang] || '';
        box.classList.add('has-cover-img');
      } else {
        if (img) img.remove();
        box.classList.remove('has-cover-img');
      }
    }

    function updateSpotlight() {
      if (!document.getElementById('booksCatalog')) return; // این بخش فقط در صفحه‌ی اصلی وجود دارد
      const b = books[currentSpotlight];
      const t = translations[currentLang];
      document.getElementById('spotCoverTitle').textContent = b.title[currentLang];
      setCoverBox(document.querySelector('.spotlight-cover'), b);
      document.getElementById('spotTitle').textContent = b.title[currentLang];

      // اسم نویسنده اینجا کلیک‌پذیره (اگه پروفایل داشته باشه)، پس به‌جای textContent از innerHTML با escape دستی استفاده می‌شود
      const authorHtml = b.authorId
        ? authorLinkHtml(b.authorId, escapeHtml(b.author[currentLang]))
        : escapeHtml(b.author[currentLang]);
      document.getElementById('spotDesc').innerHTML =
        `${escapeHtml(b.desc[currentLang])} (${authorHtml} | ${escapeHtml(b.genre[currentLang])}) - ${escapeHtml(t.finalTotalPriceLabel)} ${b.totalPrice.toLocaleString()} ${escapeHtml(t.currency)}`;
      
      const isSaved = savedBookIds.includes(b.id);
      document.getElementById('spotSaveBtn').textContent = isSaved ? t.btnSaved : t.btnSaveForLater;
      document.getElementById('spotBioBtn').textContent = t.btnDetails;
      document.getElementById('spotReadBtn').textContent = t.btnRead;
      document.getElementById('spotReadBtn').onclick = () => openReader(b.id);
      document.getElementById('spotBuyBtn').textContent = t.btnBuy;
      document.getElementById('spotBuyBtn').onclick = () => addToCart(b.id);
    }

    function getUserTier() {
      if (currentActiveUser) return 3;
      const hasFootprint =
        (safeReadStorage('pdf_market_saved_books', [], 'array').length > 0) ||
        (safeReadStorage('pdf_market_search_history', [], 'array').length > 0) ||
        (safeReadStorage('pdf_market_viewed_books', [], 'array').length > 0) ||
        (safeReadStorage('pdf_market_cart_ids', [], 'array').length > 0);
      return hasFootprint ? 2 : 1;
    }

    function buildLightAffordablePool() {
      if (books.length === 0) return [];
      const pages = books.map(b => b.pages);
      const prices = books.map(b => b.totalPrice);
      const minP = Math.min(...pages), maxP = Math.max(...pages);
      const minPr = Math.min(...prices), maxPr = Math.max(...prices);
      const scored = books.map(b => {
        const pageScore = maxP === minP ? 0 : (b.pages - minP) / (maxP - minP);
        const priceScore = maxPr === minPr ? 0 : (b.totalPrice - minPr) / (maxPr - minPr);
        return { book: b, score: pageScore * 0.5 + priceScore * 0.5 };
      });
      scored.sort((a, b) => a.score - b.score);
      const poolSize = Math.max(1, Math.ceil(books.length * 0.4));
      return scored.slice(0, poolSize).map(s => s.book);
    }

    function getInterestGroupKeys(weightedIds) {
      const counts = {};
      weightedIds.forEach(({ id, weight }) => {
        const b = books.find(x => x.id === id);
        if (!b) return;
        const key = b.genreGroup || b.author[currentLang];
        counts[key] = (counts[key] || 0) + weight;
      });
      return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([key]) => key);
    }

    function poolByInterestKeys(keys) {
      if (!keys.length) return [];
      const topKeys = keys.slice(0, 2);
      return books.filter(b => topKeys.includes(b.genreGroup || b.author[currentLang]));
    }

    function matchSearchHistoryToBooks(searchHist) {
      const matches = [];
      searchHist.forEach(q => {
        books.forEach(b => {
          const hay = `${b.title[currentLang]} ${b.author[currentLang]} ${b.genre[currentLang]}`.toLowerCase();
          if (hay.includes(q)) matches.push({ id: b.id, weight: 1 });
        });
      });
      return matches;
    }

    function buildSuggestionPool() {
      const tier = getUserTier();
      const lightPool = buildLightAffordablePool();

      if (tier === 1) {
        return lightPool;
      }

      const viewed = safeReadStorage('pdf_market_viewed_books', [], 'array');
      const saved = savedBookIds;
      const searchHist = safeReadStorage('pdf_market_search_history', [], 'array');

      if (tier === 2) {
        const weighted = [
          ...viewed.map(id => ({ id, weight: 1 })),
          ...saved.map(id => ({ id, weight: 2 })),
          ...matchSearchHistoryToBooks(searchHist)
        ];
        const keys = getInterestGroupKeys(weighted);
        const interestPool = poolByInterestKeys(keys);
        if (!interestPool.length) return lightPool;
        return [...interestPool, ...interestPool, ...lightPool];
      }

      // tier === 3
      const ownedIds = (currentActiveUser.purchasedBooks || []).map(pb => pb.id);
      const weighted = [
        ...ownedIds.map(id => ({ id, weight: 3 })),
        ...saved.map(id => ({ id, weight: 2 })),
        ...viewed.map(id => ({ id, weight: 1 })),
        ...matchSearchHistoryToBooks(searchHist)
      ];
      const keys = getInterestGroupKeys(weighted);
      let interestPool = poolByInterestKeys(keys).filter(b => !ownedIds.includes(b.id));
      if (!interestPool.length) {
        interestPool = lightPool.filter(b => !ownedIds.includes(b.id));
      }
      return interestPool.length ? interestPool : books.filter(b => !ownedIds.includes(b.id));
    }

    function pickNextRandomSpotlight() {
      if (books.length <= 1) return;
      const pool = buildSuggestionPool();
      const candidates = pool.length ? pool : books;
      const currentBookId = books[currentSpotlight] ? books[currentSpotlight].id : null;
      let nextBook, attempts = 0;
      do {
        nextBook = candidates[Math.floor(Math.random() * candidates.length)];
        attempts++;
      } while (nextBook.id === currentBookId && candidates.length > 1 && attempts < 20);
      const foundIndex = books.findIndex(b => b.id === nextBook.id);
      currentSpotlight = foundIndex >= 0 ? foundIndex : currentSpotlight;
      updateSpotlight();
    }

    function nextSpotlight() {
      currentSpotlight = (currentSpotlight + 1) % books.length;
      updateSpotlight();
      restartSpotlightTimer();
    }

    function prevSpotlight() {
      currentSpotlight = (currentSpotlight - 1 + books.length) % books.length;
      updateSpotlight();
      restartSpotlightTimer();
    }

    // سوایپ انگشت روی ویترین پیشنهاد تصادفی، جایگزین دکمه‌های فلش در موبایل
    (function initSpotlightSwipe() {
      const box = document.getElementById('spotlightBox');
      if (!box) return;
      let touchStartX = 0;
      let touchStartY = 0;
      let isSwiping = false;
      const SWIPE_THRESHOLD = 40; // حداقل جابجایی افقی برای شناخته‌شدن به‌عنوان سوایپ (پیکسل)

      box.addEventListener('touchstart', (e) => {
        if (e.touches.length !== 1) return;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        isSwiping = true;
      }, { passive: true });

      box.addEventListener('touchend', (e) => {
        if (!isSwiping) return;
        isSwiping = false;
        const touch = e.changedTouches[0];
        const deltaX = touch.clientX - touchStartX;
        const deltaY = touch.clientY - touchStartY;
        // اگر جابجایی عمودی بیشتر از افقی بود، یعنی کاربر داشته اسکرول صفحه می‌کرده، نه سوایپ کارت
        if (Math.abs(deltaX) < SWIPE_THRESHOLD || Math.abs(deltaX) < Math.abs(deltaY)) return;
        if (deltaX < 0) {
          nextSpotlight();
        } else {
          prevSpotlight();
        }
      }, { passive: true });
    })();

    function restartSpotlightTimer() {
      if (spotlightIntervalId) clearInterval(spotlightIntervalId);
      spotlightIntervalId = setInterval(() => {
        pickNextRandomSpotlight();
      }, 16000);
    }

    function openBookBio(bookId) {
      currentBioBookId = bookId;
      try {
        let viewed = safeReadStorage('pdf_market_viewed_books', [], 'array');
        viewed = viewed.filter(id => id !== bookId);
        viewed.unshift(bookId);
        viewed = viewed.slice(0, 30); // فقط ۳۰ بازدید اخیر نگه‌داشته می‌شود
        localStorage.setItem('pdf_market_viewed_books', JSON.stringify(viewed));
      } catch (e) { /* حافظه‌ی مرورگر پر یا غیرفعال است */ }
      const b = books.find(item => item.id === bookId);
      const t = translations[currentLang];

      document.getElementById('bioModalTitle').textContent = `${t.bioModalTitle}: ${b.title[currentLang]}`;
      document.getElementById('bioCoverTitle').textContent = b.title[currentLang];
      setCoverBox(document.querySelector('.book-bio-cover'), b);
      const bioAuthorElem = document.getElementById('bioAuthor');
      if (b.authorId) {
        bioAuthorElem.innerHTML = authorLinkHtml(b.authorId, escapeHtml(b.author[currentLang]), null, 'closeBookBio()');
      } else {
        bioAuthorElem.textContent = b.author[currentLang];
      }
      document.getElementById('bioGenreBadge').textContent = `🏷️ ${b.genre[currentLang]}`;
      
      document.getElementById('bioPublisher').textContent = b.publisher[currentLang];
      document.getElementById('bioTranslator').textContent = b.translator[currentLang];
      document.getElementById('bioPages').textContent = `${b.pages} ${t.pagesUnit}`;
      document.getElementById('bioPrice').innerHTML = dealPriceHtml(b, t);
      document.getElementById('bioSummaryText').textContent = b.bio[currentLang];

      document.getElementById('bioReadBtn').textContent = t.btnRead;
      document.getElementById('bioReadBtn').onclick = () => { closeBookBio(); openReader(b.id); };
      document.getElementById('bioBuyBtn').textContent = t.btnBuy;
      document.getElementById('bioBuyBtn').onclick = () => addToCart(b.id);

      document.getElementById('bookBioModal').style.display = 'flex';
    }

    function closeBookBio() {
      document.getElementById('bookBioModal').style.display = 'none';
    }

    function openAuthorProfile(authorId) {
      const a = authors.find(item => item.id === authorId);
      if (!a) return; // نویسنده‌ای با این شناسه ثبت نشده؛ به‌جای کرش، فقط بی‌اثر برمی‌گردیم
      currentAuthorProfileId = authorId;
      const t = translations[currentLang];

      document.getElementById('authorProfileAvatar').innerHTML = avatarImgHtml(a.avatarEmoji || '👤');
      document.getElementById('authorProfileName').textContent = a.name[currentLang];

      const lifespan = a.deathYear
        ? `${a.birthYear} - ${a.deathYear}`
        : `${a.birthYear} ${t.authorAliveSuffix}`;
      document.getElementById('authorProfileLifespan').textContent = lifespan;
      document.getElementById('authorProfileNationality').textContent = a.nationality[currentLang];
      document.getElementById('authorProfileGenre').textContent = a.genre[currentLang];

      const awardsRow = document.getElementById('authorProfileAwardsRow');
      if (a.awards && a.awards[currentLang]) {
        awardsRow.style.display = '';
        document.getElementById('authorProfileAwards').textContent = a.awards[currentLang];
      } else {
        awardsRow.style.display = 'none';
      }

      const quoteBox = document.getElementById('authorProfileQuoteBox');
      if (a.quote && a.quote[currentLang]) {
        quoteBox.style.display = 'block';
        quoteBox.textContent = a.quote[currentLang];
      } else {
        quoteBox.style.display = 'none';
      }

      document.getElementById('authorProfileBio').textContent = a.bio[currentLang];

      const authorBooks = books.filter(b => b.authorId === authorId);
      document.getElementById('authorProfileBooksHeading').textContent =
        `${t.authorBooksHeadingPrefix} ${a.name[currentLang]} (${authorBooks.length})`;
      const grid = document.getElementById('authorProfileBooksGrid');
      grid.innerHTML = authorBooks.length
        ? authorBooks.map(b => buildBookCardHtml(b)).join('')
        : `<p style="grid-column: 1/-1; text-align:center; padding:20px; color:var(--text-muted);">${t.authorNoBooksText}</p>`;

      document.getElementById('authorProfileModal').style.display = 'flex';
    }

    function closeAuthorProfile() {
      document.getElementById('authorProfileModal').style.display = 'none';
      currentAuthorProfileId = null;
    }

    // اگه این نویسنده صفحه‌ی اختصاصی (URL واقعی) داشته باشه، آدرس همون صفحه رو برمی‌گردونه؛ وگرنه null
    function getAuthorPageUrl(authorId) {
      const a = authors.find(x => x.id === authorId);
      return (a && a.slug) ? ((currentLang === 'en' ? 'en-author-' : 'author-') + encodeURIComponent(a.slug) + '.html') : null;
    }

    // لینک قابل‌کلیک روی اسم نویسنده رو می‌سازه: اگه صفحه‌ی اختصاصی داشته باشه یه <a> واقعی (کلیک راست/تب‌جدید هم کار می‌کنه)،
    // وگرنه مثل قبل یه <span> که مودال پروفایل رو باز می‌کنه
    function authorLinkHtml(authorId, labelHtml, extraClass, onclickPrefix) {
      const cls = 'author-link' + (extraClass ? ' ' + extraClass : '');
      const url = getAuthorPageUrl(authorId);
      if (url) {
        return `<a class="${cls}" href="${url}">${labelHtml}</a>`;
      }
      const prefix = onclickPrefix ? onclickPrefix + '; ' : '';
      return `<span class="${cls}" onclick="${prefix}openAuthorProfile('${authorId}')">${labelHtml}</span>`;
    }

    function openAboutModal(fromRestore) {
      closeDrawer();
      document.getElementById('aboutModal').style.display = 'flex';
      if (!fromRestore) {
        const panelOpen = document.getElementById('userPanelModal').style.display === 'flex';
        rememberOpenModal(panelOpen ? 'panel_about' : 'about');
      }
      document.title = (currentLang === 'fa' ? 'راهنمای جامع | ' : 'Comprehensive Guide | ') + brandPlainName();
    }

    function closeAboutModal() {
      document.getElementById('aboutModal').style.display = 'none';
      const panelOpen = document.getElementById('userPanelModal').style.display === 'flex';
      if (panelOpen) {
        rememberOpenModal('panel');
        document.title = (currentLang === 'fa' ? 'پنل شخصی کاربر | ' : 'My Account | ') + brandPlainName();
      } else {
        forgetOpenModal('about');
        document.title = homeDocTitle();
      }
    }

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.dropdown-container')) {
        document.querySelectorAll('.color-menu-grid').forEach(m => m.classList.remove('show'));
      }
    });

    // کلیک روی پس‌زمینه‌ی تیره: هر مودال با تابع بستن مخصوص خودش بسته می‌شود
    // (مودال ورود/ثبت‌نام عمداً نیست تا فرم نیمه‌کاره با یک کلیک اشتباه پاک نشود)
    const MODAL_BACKDROP_CLOSE = {
      cartModal: closeCartModal,
      savedBooksModal: closeSavedBooksModal,
      avatarSelectModal: closeAvatarSelectModal,
      avatarHelpModal: closeAvatarHelpModal,
      avatarPreviewModal: cancelVipAvatarPreview,
      changeUsernameModal: closeChangeUsernameModal,
      phoneVerifyModal: closePhoneVerifyModal,
      walletTransactionsModal: closeWalletTransactionsModal,
      referralHelpModal: closeReferralHelpModal,
      userPanelModal: closeUserPanelModal,
      welcomeEntryModal: closeWelcomeEntryModal,
      bookBioModal: closeBookBio,
      authorProfileModal: closeAuthorProfile,
      readerModal: closeReader,
      aboutModal: closeAboutModal,
      questionModal: closeQuestionModal
    };
    document.querySelectorAll('.modal-backdrop').forEach(modal => {
      const closeFn = MODAL_BACKDROP_CLOSE[modal.id];
      if (!closeFn) return;
      let pressStartedOnBackdrop = false;
      modal.addEventListener('mousedown', (e) => { pressStartedOnBackdrop = (e.target === modal); });
      modal.addEventListener('click', (e) => {
        // فقط وقتی هم فشردن و هم رها کردن ماوس روی پس‌زمینه بود (کشیدن برای انتخاب متن مودال را نمی‌بندد)
        if (e.target === modal && pressStartedOnBackdrop) closeFn();
        pressStartedOnBackdrop = false;
      });
    });

    // توقف چرخش خودکار ویترین وقتی ماوس روی آن است
    const spotBox = document.getElementById('spotlightBox');
    if (spotBox) {
      spotBox.addEventListener('mouseenter', () => { if (spotlightIntervalId) clearInterval(spotlightIntervalId); });
      spotBox.addEventListener('mouseleave', () => restartSpotlightTimer());
    }

    /* قفل اسکرول صفحه‌ی زمینه وقتی هر مودالی باز است.
       تغییر display مودال‌ها را زیر نظر می‌گیرد و به توابع open/close دست نمی‌زند. */
    (function initModalScrollLock() {
      const modals = document.querySelectorAll('.modal-backdrop');
      const body = document.body;
      const root = document.documentElement;

      const isOpen = (m) => getComputedStyle(m).display !== 'none';
      let lockedScrollY = 0;

      function syncScrollLock() {
        const shouldLock = Array.from(modals).some(isOpen);
        if (shouldLock === body.classList.contains('modal-open')) return;

        if (shouldLock) {
          // عرض اسکرول‌بار باید قبل از fixed شدن body اندازه‌گیری شود
          const scrollbarWidth = window.innerWidth - root.clientWidth;
          body.style.setProperty('--scrollbar-comp', scrollbarWidth + 'px');
          // موقعیت فعلی اسکرول را نگه می‌داریم تا با position:fixed جا به جا نشود؛
          // همین «جای خالی برای اسکرول» است که به مرورگر اجازه می‌دهد ژست
          // pull-to-refresh را هم وقتی مودال باز است تشخیص بدهد.
          lockedScrollY = window.scrollY || window.pageYOffset || root.scrollTop || body.scrollTop || 0;
          body.style.top = -lockedScrollY + 'px';
          body.classList.add('modal-open');
          root.classList.add('modal-open');
        } else {
          body.classList.remove('modal-open');
          root.classList.remove('modal-open');
          body.style.removeProperty('--scrollbar-comp');
          body.style.removeProperty('top');
          window.scrollTo(0, lockedScrollY);
        }
      }

      const observer = new MutationObserver(syncScrollLock);
      modals.forEach((m) =>
        observer.observe(m, { attributes: true, attributeFilter: ['style', 'class'] })
      );

      syncScrollLock();
    })();

    // بازیابی زبان ذخیره‌شده کاربر لاگین‌شده، همان لحظه‌ی اول بارگذاری صفحه (قبل از رندر بقیه‌ی محتوا)
    // زبان پیش‌فرض صفحه فارسی است؛ اگر کاربر قبلاً انگلیسی را برای حسابش ذخیره کرده بود، همینجا سوییچ می‌شود
    (function restoreUserLanguagePreference() {
      // زبان از روی آدرس صفحه تعیین می‌شود (فارسی یا en-...)؛ ترجیح ذخیره‌شده‌ی کاربر روی آن اثری ندارد
      if (window.PAGE_LANG) {
        if (window.PAGE_LANG !== currentLang) {
          window.__langBoot = true;
          try { toggleLanguage(); } finally { window.__langBoot = false; }
        }
        return;
      }
      try {
        const sessionUserRaw = localStorage.getItem('pdf_market_active_session');
        if (!sessionUserRaw) return;
        const sessionUserObj = JSON.parse(sessionUserRaw);
        if (sessionUserObj && sessionUserObj.preferredLang && sessionUserObj.preferredLang !== currentLang) {
          toggleLanguage();
        }
      } catch (e) { /* نشست خراب یا ناقص بود؛ زبان پیش‌فرض فارسی باقی می‌ماند */ }
    })();

    syncDesktopModeButtons(isForceDesktopModeOn());
    initWelcomeExperience();
    initColors();
    populateDrawer();
    updateSavedBooksBadge();
    initUserAuthState();
    prefetchAvatarImages(); // پیش‌بارگذاری آواتارها در پس‌زمینه تا مودال انتخاب آواتار سریع باز شود

    // این بخش‌ها (ویترین تصادفی، ردیف چهره‌ها، جستجو+فهرست کامل کتاب‌ها) فقط توی صفحه‌ی اصلیه؛
    // توی صفحه‌ی اختصاصی نویسنده اصلاً وجود ندارن، پس فقط وقتی #booksCatalog واقعاً روی صفحه هست اجراشون می‌کنیم
    if (document.getElementById('booksCatalog')) {
      renderFeaturedTrain();
      handleSmartSearch();
      pickNextRandomSpotlight();
      restartSpotlightTimer();
    }

    refreshBookSaveBtn();

    // صفحه‌ی اختصاصی نویسنده: اگه #authorBooksCatalog روی صفحه باشه، فهرست کتاب‌های همون نویسنده رو پر می‌کنیم
    const authorBooksGridEl = document.getElementById('authorBooksCatalog');
    if (authorBooksGridEl) {
      const pageAuthorId = authorBooksGridEl.dataset.authorId;
      const authorBooks = books.filter(b => b.authorId === pageAuthorId);
      authorBooksGridEl.innerHTML = authorBooks.length
        ? authorBooks.map(b => buildBookCardHtml(b)).join('')
        : `<p style="grid-column: 1/-1; text-align:center; padding:20px; color:var(--text-muted);">${currentLang === 'fa' ? 'فعلاً کتابی از این نویسنده ثبت نشده است.' : 'No books from this author yet.'}</p>`;
    }

    // بازیابی مودالی که قبل از رفرش باز بوده (از sessionStorage، نه از تاریخچه‌ی مرورگر؛
    // به همین دلیل روی هر مرورگری با هر نوع رفرشی - چه با کشیدن صفحه، چه با دکمه‌ی خودِ
    // مرورگر - یکسان و بدون گیر کردن در تاریخچه کار می‌کنه).
    let openModalOnLoad = null;
    try { openModalOnLoad = sessionStorage.getItem(OPEN_MODAL_KEY); } catch (e) {}
    if (openModalOnLoad === 'panel' || openModalOnLoad === 'panel_about') {
      if (currentActiveUser) {
        openUserPanelModal(true);
        if (openModalOnLoad === 'panel_about') openAboutModal(true);
      } else {
        // چون این صفحه خصوصی است، بدون ورود به آن راهی نیست
        forgetOpenModal();
      }
    } else if (openModalOnLoad === 'about') {
      openAboutModal(true);
    } else if (openModalOnLoad === 'cart') {
      openCartModal(true);
    }
  

/* ===== کشیدن به پایین برای رفرش، وقتی پنجره (مودال) باز است =====
   کروم موبایل ژست رفرش خودش را فقط وقتی صفحه‌ی زیر پنجره‌ها قابل‌اسکرول باشد قبول می‌کند و با پنجره‌ی باز
   معمولاً نادیده می‌گیرد. این کد همان ژست را فقط وقتی پنجره‌ای باز است خودش تشخیص می‌دهد:
   انگشت از بالای محتوای پنجره (اسکرول داخلی صفر) به پایین کشیده شود و از حدی بگذرد، صفحه رفرش می‌شود.
   خواننده‌ی PDF و فیلدهای ورودی مستثنی هستند. روی PC (ماوس) هیچ اثری ندارد. */
(function initModalPullToRefresh() {
  var THRESHOLD = 90;      // پیکسل کشیدن لازم برای رفرش
  var ind = null, startY = 0, startX = 0, dy = 0, active = false, done = false;

  function indicator() {
    if (ind) return ind;
    ind = document.createElement('div');
    ind.setAttribute('aria-hidden', 'true');
    ind.textContent = '\u21BB';
    ind.style.cssText = 'position:fixed;left:50%;top:calc(env(safe-area-inset-top,0px) + 6px);width:38px;height:38px;margin-left:-19px;'
      + 'border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:22px;line-height:1;'
      + 'background:var(--card-bg,#fff);color:var(--primary,#c95c5c);border:1px solid var(--border,#ddd);'
      + 'box-shadow:0 2px 10px rgba(0,0,0,.25);z-index:100000;pointer-events:none;opacity:0;transform:translateY(-60px);';
    document.body.appendChild(ind);
    return ind;
  }
  function hide() {
    if (!ind) return;
    ind.style.transition = 'transform .2s, opacity .2s';
    ind.style.opacity = '0';
    ind.style.transform = 'translateY(-60px)';
  }
  function canStart(target) {
    if (!document.body.classList.contains('modal-open')) return false;
    if (!target || !target.closest) return false;
    if (target.closest('#readerModal, input, textarea, select, [contenteditable="true"]')) return false;
    // هر بخش اسکرول‌شونده‌ی بین انگشت و پنجره باید روی بالاترین نقطه‌اش باشد
    for (var el = target; el && el !== document.body; el = el.parentElement) {
      if (el.scrollHeight > el.clientHeight + 1) {
        var oy = getComputedStyle(el).overflowY;
        if ((oy === 'auto' || oy === 'scroll') && el.scrollTop > 0) return false;
      }
    }
    return true;
  }

  document.addEventListener('touchstart', function (e) {
    active = false; done = false; dy = 0;
    if (e.touches.length !== 1) return;
    if (!canStart(e.target)) return;
    startY = e.touches[0].clientY;
    startX = e.touches[0].clientX;
    active = true;
  }, { passive: true });

  document.addEventListener('touchmove', function (e) {
    if (!active || done) return;
    if (e.touches.length !== 1) { active = false; hide(); return; }
    dy = e.touches[0].clientY - startY;
    var dx = Math.abs(e.touches[0].clientX - startX);
    if (dy < -8 || dx > dy + 20) { active = false; hide(); return; }   // بالا کشیدن یا حرکت افقی: رفرش نیست
    if (dy <= 8) return;
    var el = indicator();
    var p = Math.min(dy / THRESHOLD, 1);
    el.style.transition = 'none';
    el.style.opacity = String(p);
    el.style.transform = 'translateY(' + (Math.min(dy, THRESHOLD * 1.3) * 0.6 - 40) + 'px) rotate(' + (p * 270) + 'deg)';
  }, { passive: true });

  function end() {
    if (active && !done && dy >= THRESHOLD) {
      done = true;
      var el = indicator();
      el.style.transition = 'transform .6s linear';
      el.style.transform = 'translateY(20px) rotate(720deg)';
      setTimeout(function () { location.reload(); }, 120);
    } else {
      hide();
    }
    active = false;
  }
  document.addEventListener('touchend', end, { passive: true });
  document.addEventListener('touchcancel', function () { active = false; hide(); }, { passive: true });
})();
