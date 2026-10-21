// ============================================================
// منطق بخش «کاربران» در پنل ادمین (admin.php?a=users)
// این فایل فقط داخل admin.php و فقط بعد از ورود ادمین بارگذاری می‌شود.
//
// بخش اول: توابعی که عیناً از index.html برداشته شده‌اند تا منطق «برنده‌ی ماه»،
//          ماه شمسی و صندوق پیام دقیقاً همان رفتار سایت را داشته باشد.
//          (اگر در index.html قوانین مسابقه یا ساختار کاربر عوض شد، این بخش هم باید هماهنگ شود.)
// بخش دوم: خود پنل: تایید/رد عکس اختصاصی آواتار و ارسال پیام به کاربر.
//
// نکته: اطلاعات کاربران (pdf_market_users_db) در localStorage مرورگر خوانده می‌شود،
//       پس این بخش همان کاربرانی را می‌بیند که روی همین مرورگر/دستگاه ثبت‌نام کرده‌اند
//       (همان رفتار پنل تستی قبلی).
// ============================================================

let currentActiveUser = null;

function escapeHtml(str) {
  return String(str == null ? '' : str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function normalizeDigits(str) {
  return convertPersianDigitsToEnglish(str);
}

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

function getUsersDatabase() {
  // خواندن امن: JSON خراب یا نوع اشتباه، پنل را از کار نمی‌اندازد (مقدار خراب یک بار پشتیبان‌گیری می‌شود)
  let db = null;
  try { db = localStorage.getItem('pdf_market_users_db'); } catch (e) { return []; }
  if (!db) return [];
  try {
    const v = JSON.parse(db);
    if (Array.isArray(v)) return v.filter(u => u && typeof u === 'object');
  } catch (e) { /* خراب است */ }
  try {
    if (localStorage.getItem('pdf_market_users_db__corrupt_backup') === null) {
      localStorage.setItem('pdf_market_users_db__corrupt_backup', db);
    }
  } catch (e) {}
  return [];
}

// موفق = true | ناموفق (حافظه‌ی مرورگر پر است یا مرورگر اجازه نمی‌دهد) = false. خطا بیرون نمی‌پرد؛ فراخواننده باید نتیجه را بررسی کند.
const ADM_SAVE_FAIL = 'ذخیره نشد؛ حافظه‌ی مرورگر پر است یا مرورگر اجازه‌ی ذخیره نمی‌دهد. چیزی تغییر نکرد.';
function saveUsersDatabase(users) {
  try { localStorage.setItem('pdf_market_users_db', JSON.stringify(users)); return true; }
  catch (e) { return false; }
}

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

const CHAMPIONS_KEY = 'pdf_market_champions';

const PRESENCE_KEY = 'pdf_market_presence';

const MONTH_NAMES_FA = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];

const MONTH_NAMES_EN = ['Farvardin', 'Ordibehesht', 'Khordad', 'Tir', 'Mordad', 'Shahrivar', 'Mehr', 'Aban', 'Azar', 'Dey', 'Bahman', 'Esfand'];

function fmtL(lang, n) { return Number(n || 0).toLocaleString(lang === 'fa' ? 'fa-IR' : 'en-US'); }

function monthNameOf(monthKey, lang) {
  const m = parseInt(String(monthKey).split('-')[1], 10);
  const arr = lang === 'fa' ? MONTH_NAMES_FA : MONTH_NAMES_EN;
  return arr[m - 1] || String(monthKey);
}

function addDaysToDate(date, n) { return new Date(date.getTime() + n * 86400000); }

function getAdjacentMonthKey(dir) { return addMonthsToKey(getCurrentMonthKey(), dir); }

function readPresence() {
  try {
    const raw = JSON.parse(localStorage.getItem(PRESENCE_KEY) || '{}');
    return (raw && typeof raw === 'object' && !Array.isArray(raw)) ? raw : {};
  } catch (e) { return {}; }
}

function getVipUnlockedCount(user) {
  const { chain } = getUnlockedAvatarList(user);
  return chain.filter(c => c.unlocked).length;
}

function isVipEligible(user) { return getVipUnlockedCount(user) >= 9; }

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

function getEligibleContenders(monthKey) {
  const ctx = { pend: readReadingPending(), pres: readPresence() };
  return getUsersDatabase()
    .filter(u => isVipEligible(u))
    .map(u => ({ phone: u.phone, username: u.username, reg: u.regTimestamp || 0, d: getUserMonthlyDetail(u, monthKey, ctx) }))
    .filter(c => (c.d.books + c.d.refs + c.d.readSeconds + c.d.presenceSeconds) > 0);
}

function champTieKey(c) { return levelVals(c.d).join('|'); }

function champCompare(a, b) {
  const x = levelVals(a.d), y = levelVals(b.d);
  for (let i = 0; i < 4; i++) if (x[i] !== y[i]) return y[i] - x[i];
  return (b.d.readSeconds - a.d.readSeconds)
    || (b.d.presenceSeconds - a.d.presenceSeconds)
    || (a.reg - b.reg)
    || String(a.phone).localeCompare(String(b.phone));
}

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

function readChampions() {
  try {
    const raw = JSON.parse(localStorage.getItem(CHAMPIONS_KEY) || '{}');
    return (raw && typeof raw === 'object' && !Array.isArray(raw)) ? raw : {};
  } catch (e) { return {}; }
}

function writeChampions(obj) {
  try { localStorage.setItem(CHAMPIONS_KEY, JSON.stringify(obj)); return true; } catch (e) { return false; /* حافظه‌ی مرورگر پر یا غیرفعال است */ }
}

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
  if (!saveUsersDatabase(users)) return false;
  if (currentActiveUser && currentActiveUser.phone === phone) {
    currentActiveUser.inbox = u.inbox;
    if (extra) Object.assign(currentActiveUser, extra);
    try { localStorage.setItem('pdf_market_active_session', JSON.stringify(currentActiveUser)); } catch (e) {}
  }
  return true;
}

// پیام را فقط به شیء کاربر اضافه می‌کند (ذخیره نمی‌کند)؛ تا تغییر کاربر و پیامش با هم و در یک ذخیره بروند
function adminPushInbox(u, msg) {
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
}

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

function ensureAvatarProgress(user) {
  if (!user.avatarProgress) {
    user.avatarProgress = { idx: 0, baseBooks: 0, baseMins: 0, baseRefs: 0 };
  }
  return user.avatarProgress;
}

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

const READING_PENDING_KEY = 'pdf_market_pending_reading';

function readReadingPending() {
  try {
    const raw = JSON.parse(localStorage.getItem(READING_PENDING_KEY) || '{}');
    return (raw && typeof raw === 'object' && !Array.isArray(raw)) ? raw : {};
  } catch (e) {
    return {};
  }
}

function convertPersianDigitsToEnglish(str) {
  const persian = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const arabic = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  let result = String(str);
  for (let i = 0; i < 10; i++) {
    result = result.replace(new RegExp(persian[i], 'g'), i).replace(new RegExp(arabic[i], 'g'), i);
  }
  return result;
}

// ---------- اتصال به نشست کاربرِ لاگین‌شده در همین مرورگر (اگر باشد) ----------
try {
  const rawSession = localStorage.getItem('pdf_market_active_session');
  currentActiveUser = rawSession ? JSON.parse(rawSession) : null;
} catch (e) { currentActiveUser = null; }

// ============================================================
// بخش دوم: پنل
// ============================================================
function adminNotice(type, text) {
  if (window.admToast) { window.admToast(type, text); return; }   // toast (admin-feedback.php)
  const el = document.getElementById('adminNotice');
  if (!el) return;
  el.className = 'msg ' + type;
  el.textContent = text;
  el.style.display = 'block';
  el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// اگر همین کاربر الان در همین مرورگر لاگین است، نشستش هم به‌روز شود
function adminRefreshSession(user) {
  if (currentActiveUser && user && currentActiveUser.phone === user.phone) {
    currentActiveUser = user;
    try { localStorage.setItem('pdf_market_active_session', JSON.stringify(currentActiveUser)); } catch (e) {}
  }
}

function adminUsers() {
  try {
    const u = getUsersDatabase();
    return Array.isArray(u) ? u.filter(x => x && typeof x === 'object') : [];
  } catch (e) { return []; }
}

// فقط از کش می‌خواند (بدون محاسبه و بدون ارسال پیام)
function adminCachedChampionPhone() {
  try {
    const rec = readChampions()[getCurrentMonthKey()];
    return rec && rec.phone ? rec.phone : null;
  } catch (e) { return null; }
}

const fa = n => Number(n || 0).toLocaleString('fa-IR');

// ---------- آمار بالای صفحه ----------
function adminRenderKpis() {
  const el = document.getElementById('uKpis');
  if (!el) return;
  const users = adminUsers();
  const pend = users.filter(u => u.pendingAvatarImage).length;
  const champPhone = adminCachedChampionPhone();
  const champ = champPhone ? users.find(u => u.phone === champPhone) : null;
  const newUsers = users.filter(adminIsNewUser).length;
  const unreadTotal = users.reduce((acc, u) => acc + adminUnreadCount(u), 0);
  el.innerHTML =
    '<div class="kpi"><b>' + fa(users.length) + '</b><span>کاربر ثبت‌شده</span></div>'
    + '<div class="kpi' + (pend ? ' hot' : '') + '"><b>' + fa(pend) + '</b><span>عکس در انتظار تایید</span></div>'
    + '<div class="kpi"><b style="font-size:1.1rem">' + (champ ? escapeHtml(champ.username) : '—') + '</b><span>برنده‌ی این ماه</span></div>'
    + '<div class="kpi' + (newUsers ? ' hot' : '') + '"><b>' + fa(newUsers) + '</b><span>کاربر جدید (' + fa(NEW_USER_DAYS) + ' روز اخیر)</span></div>'
    + '<div class="kpi' + (unreadTotal ? ' hot' : '') + '"><b>' + fa(unreadTotal) + '</b><span>پیام خوانده‌نشده (مجموع همه‌ی کاربران)</span></div>';
}

// ---------- کاربر جدید و پیام خوانده‌نشده ----------
const NEW_USER_DAYS = 3;
function adminIsNewUser(u) {
  const t = Number(u && u.regTimestamp);
  const now = Date.now();
  return t > 0 && (now - t) < NEW_USER_DAYS * 864e5;
}
function adminUnreadCount(u) {
  return u && Array.isArray(u.inbox) ? u.inbox.filter(m => m && !m.read).length : 0;
}

// ---------- عکس‌های در انتظار ----------
function adminRenderPending() {
  const container = document.getElementById('adminPendingList');
  if (!container) return;
  const pending = adminUsers().filter(u => u.pendingAvatarImage);
  const bar = document.getElementById('adminBulkBar');
  if (bar) bar.style.display = pending.length ? 'flex' : 'none';
  const all = document.getElementById('adminPendAll');
  if (all) all.checked = false;

  if (pending.length === 0) {
    container.innerHTML = '<p class="hint" style="text-align:center;padding:18px 0;">در حال حاضر هیچ عکسی در انتظار بررسی نیست.</p>';
    adminUpdateBulkCount();
    return;
  }
  const champPhone = adminCachedChampionPhone();
  container.innerHTML = pending.map(u => {
    const when = u.pendingAvatarSubmittedAt ? new Date(u.pendingAvatarSubmittedAt).toLocaleString('fa-IR') : '';
    const isChamp = champPhone && champPhone === u.phone;
    const ph = escapeHtml(u.phone);
    return '<div class="review-card">'
      + '<input type="checkbox" class="pend-chk" data-phone="' + ph + '" aria-label="انتخاب">'
      + '<img src="' + escapeHtml(u.pendingAvatarImage) + '" alt="" data-zoom="' + ph + '">'
      + '<div style="flex:1;font-size:.88rem;min-width:140px">'
      +   '<div><strong>' + escapeHtml(u.username) + '</strong> <span class="ltr" style="display:inline-block">(' + ph + ')</span></div>'
      +   '<div class="hint">ارسال‌شده: ' + escapeHtml(when) + '</div>'
      +   (isChamp ? '<span class="tag ok">برنده‌ی این ماه</span>' : '')
      + '</div>'
      + '<div style="display:flex;flex-direction:column;gap:6px;">'
      +   '<button type="button" class="btn sm" data-act="approve" data-phone="' + ph + '">✅ تایید</button>'
      +   '<button type="button" class="btn danger sm" data-act="reject" data-phone="' + ph + '">❌ رد</button>'
      + '</div></div>';
  }).join('');
  adminUpdateBulkCount();
}

function adminSelectedPhones() {
  return Array.from(document.querySelectorAll('.pend-chk:checked')).map(c => c.getAttribute('data-phone'));
}

function adminUpdateBulkCount() {
  const el = document.getElementById('adminBulkCount');
  if (!el) return;
  const n = adminSelectedPhones().length;
  el.textContent = n ? fa(n) + ' مورد انتخاب شده' : '';
}

// برمی‌گرداند: 'approved' | 'rejected' | 'missing'
function adminApproveAvatar(phone, quiet) {
  // فقط برنده‌ی همین ماه می‌تواند عکس اختصاصی داشته باشد
  const champRec = finalizeMonthlyChampion();
  if (!champRec.phone || champRec.phone !== phone) {
    const rr = adminRejectAvatar(phone, true, true, NOT_WINNER_REASON);
    if (rr === 'error') { if (!quiet) adminNotice('err', ADM_SAVE_FAIL); return 'error'; }
    if (!quiet) { adminRenderAll(); adminNotice('err', '⛔ این کاربر برنده‌ی این ماه نیست؛ عکس رد شد.'); }
    return 'rejected';
  }
  const users = getUsersDatabase();
  const uIdx = users.findIndex(u => u.phone === phone);
  if (uIdx === -1) return 'missing';

  users[uIdx].avatar = users[uIdx].pendingAvatarImage;
  users[uIdx].avatarApprovedAt = Date.now();
  users[uIdx].customAvatarApprovedMonthKey = getCurrentMonthKey();
  delete users[uIdx].pendingAvatarImage;
  delete users[uIdx].pendingAvatarSubmittedAt;
  delete users[uIdx].previousAvatar;
  // تغییر عکس و پیام اطلاع‌رسانی در یک ذخیره: یا هر دو انجام می‌شود یا هیچ‌کدام
  adminPushInbox(users[uIdx], {
    kind: 'system',
    fa: { title: '✅ عکس اختصاصی شما تایید شد', body: 'عکس شخصی‌سازی‌شده‌ی شما توسط مدیریت تایید شد و تا پایان همین ماه روی پروفایل شما فعال است.' },
    en: { title: '✅ Your custom photo was approved', body: 'Your personalized photo was approved by management and stays active on your profile until the end of this month.' }
  });
  if (!saveUsersDatabase(users)) { if (!quiet) adminNotice('err', ADM_SAVE_FAIL); return 'error'; }
  adminRefreshSession(users[uIdx]);
  if (!quiet) { adminRenderAll(); adminNotice('ok', '✅ عکس تایید شد و پیام برای کاربر ارسال شد.'); }
  return 'approved';
}

// ---------- دلیل رد عکس ----------
const REJECT_REASONS = [
  { id: 'r1', fa: 'عکس واضح یا باکیفیت نیست', en: 'The photo is blurry or low quality' },
  { id: 'r2', fa: 'محتوای عکس مناسب نیست', en: 'The photo content is not appropriate' },
  { id: 'r3', fa: 'عکس شخصی شما نیست (از اینترنت یا شخص دیگری است)', en: 'The photo is not your own (taken from the internet or someone else)' },
  { id: 'r4', fa: 'روی عکس نوشته، تبلیغ یا اطلاعات تماس هست', en: 'The photo contains text, ads or contact details' }
];
const NOT_WINNER_REASON = {
  fa: '• فقط برنده‌ی همین ماه می‌تواند عکس اختصاصی داشته باشد.',
  en: '• Only this month\'s winner can have a custom photo.'
};

function adminInjectRejectCss() {
  if (document.getElementById('rjStyle')) return;
  const st = document.createElement('style');
  st.id = 'rjStyle';
  st.textContent = '.rj-ov{position:fixed;inset:0;background:rgba(10,12,18,.82);z-index:150;display:grid;place-items:center;padding:16px}'
    + '.rj-box{background:var(--card);color:var(--t);border-radius:14px;max-width:460px;width:100%;max-height:100%;overflow:auto;padding:18px}'
    + '.rj-box h2{margin:0 0 6px;font-size:1.05rem}.rj-list{display:flex;flex-direction:column;gap:8px;margin:12px 0}'
    + '.rj-list label{display:flex;gap:8px;align-items:flex-start;margin:0;font-weight:400;cursor:pointer}'
    + '.rj-acts{display:flex;gap:10px;margin-top:14px;flex-wrap:wrap}.rj-acts .btn{flex:1;width:auto;margin:0}';
  document.head.appendChild(st);
}

// پنجره‌ی انتخاب دلیل؛ cb با {fa, en} صدا زده می‌شود، یا اصلاً صدا زده نمی‌شود اگر انصراف بدهد
function adminAskRejectReason(count, cb) {
  adminInjectRejectCss();
  const old = document.getElementById('rjOv');
  if (old) old.remove();
  const ov = document.createElement('div');
  ov.className = 'rj-ov';
  ov.id = 'rjOv';
  ov.setAttribute('role', 'dialog');
  ov.setAttribute('aria-modal', 'true');
  ov.innerHTML = '<div class="rj-box"><h2>رد ' + (count > 1 ? fa(count) + ' عکس' : 'عکس') + ' — دلیل رد را انتخاب کن</h2>'
    + '<p class="hint">دلیل داخل پیامی که برای کاربر ارسال می‌شود نوشته می‌شود.</p>'
    + '<div class="rj-list">' + REJECT_REASONS.map(r => '<label><input type="checkbox" value="' + r.id + '"> <span>' + escapeHtml(r.fa) + '</span></label>').join('') + '</div>'
    + '<label for="rjExtra">توضیح اضافه <span class="hint">— اختیاری</span></label><textarea id="rjExtra" rows="2"></textarea>'
    + '<div class="rj-acts"><button type="button" class="btn danger" id="rjOk">رد و ارسال پیام</button><button type="button" class="btn alt" id="rjCancel">انصراف</button></div></div>';
  document.body.appendChild(ov);
  const onKey = ev => { if (ev.key === 'Escape') close(); };
  function close() { document.removeEventListener('keydown', onKey); ov.remove(); }
  document.addEventListener('keydown', onKey);
  ov.addEventListener('click', ev => { if (ev.target === ov) close(); });
  ov.querySelector('#rjCancel').addEventListener('click', close);
  ov.querySelector('#rjOk').addEventListener('click', () => {
    const picked = Array.from(ov.querySelectorAll('input[type=checkbox]:checked')).map(c => REJECT_REASONS.find(r => r.id === c.value)).filter(Boolean);
    const extra = ov.querySelector('#rjExtra').value.trim();
    if (!picked.length && !extra) { adminNotice('err', 'حداقل یک دلیل انتخاب کن یا توضیح بنویس.'); return; }
    close();
    cb({
      fa: picked.map(r => '• ' + r.fa).concat(extra ? ['• ' + extra] : []).join('\n'),
      en: picked.map(r => '• ' + r.en).concat(extra ? ['• ' + extra] : []).join('\n')
    });
  });
  const first = ov.querySelector('input[type=checkbox]');
  if (first) first.focus();
}

// رد یک یا چند عکس: اول دلیل پرسیده می‌شود، بعد برای هر کاربر پیام (با دلیل) ارسال می‌شود
function adminRejectAsk(phones) {
  if (!phones || !phones.length) return;
  adminAskRejectReason(phones.length, reason => {
    let done = 0, bad = 0;
    phones.forEach(p => { const r = adminRejectAvatar(p, true, true, reason); if (r === 'rejected') done++; else if (r === 'error') bad++; });
    adminRenderAll();
    if (bad) { adminNotice('err', fa(bad) + ' مورد ذخیره نشد (حافظه‌ی مرورگر پر است) و تغییر نکرد' + (done ? '؛ ' + fa(done) + ' مورد رد شد.' : '.')); return; }
    adminNotice('ok', phones.length === 1 ? 'عکس رد شد و پیام (همراه دلیل) برای کاربر ارسال شد.' : fa(phones.length) + ' عکس رد شد و پیام‌ها (همراه دلیل) ارسال شد.');
  });
}

// silent: پیامی نمایش داده نشود | quiet: صفحه دوباره ساخته نشود (برای کارهای گروهی) | reason: {fa, en} دلیل رد
function adminRejectAvatar(phone, silent, quiet, reason) {
  const users = getUsersDatabase();
  const uIdx = users.findIndex(u => u.phone === phone);
  if (uIdx === -1) return 'missing';

  // آواتار قبلی برمی‌گردد؛ فقط اگر کاربر در این فاصله آواتار دیگری انتخاب نکرده باشد
  if (!users[uIdx].avatar || users[uIdx].avatar === '⏳') {
    users[uIdx].avatar = users[uIdx].previousAvatar || '👤';
  }
  delete users[uIdx].pendingAvatarImage;
  delete users[uIdx].pendingAvatarSubmittedAt;
  delete users[uIdx].previousAvatar;
  adminPushInbox(users[uIdx], {
    kind: 'system',
    fa: { title: '❌ عکس اختصاصی شما تایید نشد', body: 'عکس ارسالی شما توسط مدیریت تایید نشد.' + (reason && reason.fa ? '\nدلیل:\n' + reason.fa : '') + '\nاگر هنوز برنده‌ی این ماه هستید، می‌توانید عکس دیگری ارسال کنید.' },
    en: { title: '❌ Your custom photo was not approved', body: 'Your submitted photo was not approved by management.' + (reason && reason.en ? '\nReason:\n' + reason.en : '') + '\nIf you are still this month\'s winner you can submit another photo.' }
  });
  if (!saveUsersDatabase(users)) { if (!silent || !quiet) adminNotice('err', ADM_SAVE_FAIL); return 'error'; }
  adminRefreshSession(users[uIdx]);
  if (!quiet) adminRenderAll();
  if (!silent) adminNotice('ok', 'عکس رد شد و پیام برای کاربر ارسال شد.');
  return 'rejected';
}

function adminBulk(act) {
  const phones = adminSelectedPhones();
  if (!phones.length) { adminNotice('err', 'اول چند مورد را انتخاب کنید.'); return; }
  if (act === 'approve') {
    const champRec = finalizeMonthlyChampion();
    const others = phones.filter(p => p !== champRec.phone).length;
    let q = 'تایید ' + fa(phones.length) + ' عکس؟';
    if (others) q += '\nتوجه: فقط برنده‌ی این ماه تایید می‌شود و ' + fa(others) + ' عکس دیگر رد خواهد شد.';
    if (!confirm(q)) return;
    let ok = 0, rej = 0, bad = 0;
    phones.forEach(p => { const r = adminApproveAvatar(p, true); if (r === 'approved') ok++; else if (r === 'rejected') rej++; else if (r === 'error') bad++; });
    adminRenderAll();
    if (bad) { adminNotice('err', fa(bad) + ' مورد ذخیره نشد (حافظه‌ی مرورگر پر است) و تغییر نکرد؛ ' + fa(ok) + ' عکس تایید و ' + fa(rej) + ' عکس رد شد.'); return; }
    adminNotice('ok', '✅ ' + fa(ok) + ' عکس تایید و ' + fa(rej) + ' عکس رد شد؛ پیام‌ها ارسال شد.');
  } else {
    adminRejectAsk(phones);   // دلیل رد از ادمین پرسیده می‌شود
  }
}

// ---------- پیش‌نمایش بزرگ ----------
let lbPhone = null;
function adminOpenLightbox(phone) {
  const u = adminUsers().find(x => x.phone === phone);
  if (!u || !u.pendingAvatarImage) return;
  lbPhone = phone;
  document.getElementById('admLbImg').src = u.pendingAvatarImage;
  document.getElementById('admLbInfo').innerHTML = '<strong>' + escapeHtml(u.username) + '</strong> <span class="ltr" style="display:inline-block">(' + escapeHtml(u.phone) + ')</span>';
  document.getElementById('admLightbox').classList.add('open');
}
function adminCloseLightbox() {
  const lb = document.getElementById('admLightbox');
  if (lb) lb.classList.remove('open');
  lbPhone = null;
}

// ---------- لیست و جستجوی کاربران ----------
const USER_PAGE = 20;
const pickedPhones = new Set();   // کاربرانی که ادمین در لیست تیک زده تا پیام فقط برای آن‌ها برود
let userShown = USER_PAGE;

function adminAvatarHtml(u) {
  const a = typeof u.avatar === 'string' ? u.avatar : '';
  if (a.indexOf('data:image') === 0) return '<img src="' + escapeHtml(a) + '" alt="">';
  if (a && a.length <= 4) return escapeHtml(a);
  if (/^[A-Za-z0-9_-]+$/.test(a)) {
    return '<img src="images/avatars/' + escapeHtml(a) + '.webp" alt="" onerror="this.replaceWith(document.createTextNode(\'👤\'))">';
  }
  return '👤';
}

function adminFilterUsers(q) {
  const users = adminUsers();
  const raw = (q || '').trim();
  let list = users;
  if (raw) {
    const digits = normalizeDigits(raw).replace(/\D/g, '');
    const low = raw.toLowerCase();
    list = users.filter(u => (digits && String(u.phone || '').indexOf(digits) !== -1) || String(u.username || '').toLowerCase().indexOf(low) !== -1);
  }
  return list.slice().sort((a, b) => (b.pendingAvatarImage ? 1 : 0) - (a.pendingAvatarImage ? 1 : 0) || (adminIsNewUser(b) ? 1 : 0) - (adminIsNewUser(a) ? 1 : 0) || String(a.username || '').localeCompare(String(b.username || ''), 'fa'));
}

function adminRenderUsers() {
  const box = document.getElementById('adminUserList');
  if (!box) return;
  const input = document.getElementById('adminUserSearch');
  const list = adminFilterUsers(input ? input.value : '');
  const count = document.getElementById('adminUserCount');
  if (count) count.textContent = fa(list.length) + ' کاربر';
  const more = document.getElementById('adminUserMore');
  if (!list.length) {
    box.innerHTML = '<p class="hint" style="text-align:center;padding:16px 0">' + (input && input.value.trim() ? 'کاربری با این مشخصات پیدا نشد.' : 'هنوز کاربری روی این مرورگر ثبت‌نام نکرده است.') + '</p>';
    if (more) more.style.display = 'none';
    return;
  }
  const champPhone = adminCachedChampionPhone();
  box.innerHTML = list.slice(0, userShown).map(u => {
    const books = Array.isArray(u.purchasedBooks) ? u.purchasedBooks.length : 0;
    const unread = adminUnreadCount(u);
    const ph = escapeHtml(u.phone);
    return '<div class="urow"><label class="upick" title="انتخاب برای ارسال پیام گروهی"><input type="checkbox" data-pick-user="' + ph + '"' + (pickedPhones.has(u.phone) ? ' checked' : '') + '></label><div class="uav">' + adminAvatarHtml(u) + '</div>'
      + '<div class="grow"><strong>' + escapeHtml(u.username || '—') + '</strong> ' + (adminIsNewUser(u) ? '<span class="tag hot">جدید</span> ' : '') + '<span class="ltr" style="display:inline-block">' + ph + '</span>'
      + '<div><small>' + fa(books) + ' کتاب' + (unread ? ' · ' + fa(unread) + ' پیام خوانده‌نشده' : '') + '</small> '
      + (u.pendingAvatarImage ? '<span class="tag no">عکس در انتظار</span> ' : '')
      + (champPhone && champPhone === u.phone ? '<span class="tag ok">برنده‌ی این ماه</span>' : '') + '</div></div>'
      + '<button type="button" class="btn alt sm" data-msg="' + ph + '">پیام</button></div>';
  }).join('');
  if (more) more.style.display = list.length > userShown ? 'inline-flex' : 'none';
}

// ---------- علایق نفر اول (در انتظار تأیید) ----------
function adminRenderInterests() {
  const c = document.getElementById('adminInterestsList');
  if (!c) return;
  const pend = adminUsers().filter(u => u.interests && u.interests.status === 'pending');
  if (!pend.length) {
    c.innerHTML = '<p class="hint" style="text-align:center;padding:14px 0;">هیچ متن علایقی در انتظار بررسی نیست.</p>';
    return;
  }
  c.innerHTML = pend.map(u => {
    const ph = escapeHtml(u.phone);
    const when = u.interests.submittedAt ? new Date(u.interests.submittedAt).toLocaleString('fa-IR') : '';
    return '<div class="review-card">'
      + '<div style="flex:1;font-size:.88rem;min-width:180px">'
      +   '<div><strong>' + escapeHtml(u.username) + '</strong> <span class="ltr" style="display:inline-block">(' + ph + ')</span></div>'
      +   '<div class="hint">ارسال‌شده: ' + escapeHtml(when) + '</div>'
      +   '<div style="margin-top:6px;line-height:1.9;">' + escapeHtml(u.interests.text || '') + '</div>'
      + '</div>'
      + '<div style="display:flex;flex-direction:column;gap:6px;">'
      +   '<button type="button" class="btn sm" onclick="adminInterestAct(\'approve\',\'' + ph + '\')">✅ تایید</button>'
      +   '<button type="button" class="btn danger sm" onclick="adminInterestAct(\'reject\',\'' + ph + '\')">❌ رد</button>'
      + '</div></div>';
  }).join('');
}

function adminInterestAct(act, phone) {
  const users = getUsersDatabase();
  const u = users.find(x => x.phone === phone);
  if (!u || !u.interests || u.interests.status !== 'pending') return;
  if (act === 'approve') {
    u.interests.status = 'approved';
    u.interests.approvedAt = Date.now();
    adminPushInbox(u, {
      kind: 'system',
      fa: { title: '✅ علایق شما تایید شد', body: 'متن علایق شما توسط مدیریت تایید شد و اکنون در کارت «نفر اول» برای همه نمایش داده می‌شود. این متن دیگر قابل تغییر نیست.' },
      en: { title: '✅ Your interests were approved', body: 'Your interests text was approved and is now shown to everyone on the "Winner" card. It can no longer be changed.' }
    });
  } else {
    const reason = prompt('دلیل رد (اختیاری):', '');
    if (reason === null) return;
    u.interests.status = 'rejected';
    u.interests.rejectReason = String(reason).trim();
    adminPushInbox(u, {
      kind: 'system',
      fa: { title: '❌ علایق شما تایید نشد', body: 'متن علایق شما تایید نشد' + (u.interests.rejectReason ? ' (' + u.interests.rejectReason + ')' : '') + '. می‌توانید دوباره از نوار «علایق» در پنل شخصی متن جدیدی بنویسید.' },
      en: { title: '❌ Your interests were not approved', body: 'Your interests text was not approved' + (u.interests.rejectReason ? ' (' + u.interests.rejectReason + ')' : '') + '. You can write a new one from the "Interests" bar in your panel.' }
    });
  }
  if (!saveUsersDatabase(users)) { adminNotice('err', ADM_SAVE_FAIL); return; }
  adminRefreshSession(u);
  adminRenderAll();
  adminNotice('ok', act === 'approve' ? '✅ علایق تایید شد و پیام برای کاربر ارسال شد.' : '❌ علایق رد شد و پیام برای کاربر ارسال شد.');
}

function adminRenderAll() {
  adminRenderKpis();
  adminRenderPending();
  adminRenderInterests();
  adminRenderUsers();
  adminUpdateTarget();
}

// ---------- قالب‌های پیام ----------
const TPL_KEY = 'adm_msg_templates';
const BUILTIN_TPL = [
  { id: 'b1', name: 'تشکر از پیام', title: 'ممنون از پیام شما', body: 'سلام {نام} عزیز!\nممنون که پیام دادید. پیام شما دریافت شد و در اسرع وقت بررسی می‌شود.' },
  { id: 'b2', name: 'پاسخ به پرسش', title: 'پاسخ به پرسش شما', body: 'سلام {نام} عزیز!\nپاسخ پرسش شما:\n\n' },
  { id: 'b3', name: 'مشکل برطرف شد', title: 'مشکل شما برطرف شد', body: 'سلام {نام} عزیز!\nمشکلی که گزارش کرده بودید برطرف شد. اگر باز هم مشکلی دیدید، همین‌جا خبر بدهید.' },
  { id: 'b4', name: 'راهنمای عکس اختصاصی', title: 'راهنمای عکس اختصاصی', body: 'سلام {نام} عزیز!\nبرای عکس اختصاصی، یک عکس واضح و مناسب انتخاب کنید. عکس‌های نامناسب تایید نمی‌شوند.' }
];

function adminCustomTemplates() {
  try {
    const t = JSON.parse(localStorage.getItem(TPL_KEY) || '[]');
    return Array.isArray(t) ? t.filter(x => x && x.id && x.name) : [];
  } catch (e) { return []; }
}
function adminSaveCustomTemplates(list) {
  try { localStorage.setItem(TPL_KEY, JSON.stringify(list)); return true; } catch (e) { return false; }
}

function adminRenderTemplates() {
  const box = document.getElementById('adminTplList');
  if (!box) return;
  box.innerHTML = BUILTIN_TPL.map(t => '<button type="button" class="chip" data-tpl="' + t.id + '">' + escapeHtml(t.name) + '</button>').join('')
    + adminCustomTemplates().map(t => '<span class="chip" data-tpl="' + escapeHtml(t.id) + '">' + escapeHtml(t.name) + '<i data-tpl-del="' + escapeHtml(t.id) + '" title="حذف قالب">✕</i></span>').join('');
}

function adminApplyTemplate(id) {
  const t = BUILTIN_TPL.concat(adminCustomTemplates()).find(x => x.id === id);
  if (!t) return;
  document.getElementById('adminMsgTitle').value = t.title || '';
  const body = document.getElementById('adminMsgBody');
  body.value = t.body || '';
  body.focus();
}

function adminSaveTemplate() {
  const nameEl = document.getElementById('adminTplName');
  const name = nameEl.value.trim();
  const title = document.getElementById('adminMsgTitle').value.trim();
  const body = document.getElementById('adminMsgBody').value.trim();
  if (!name || !body) { adminNotice('err', 'برای ذخیره‌ی قالب، نام قالب و متن پیام را بنویسید.'); return; }
  const list = adminCustomTemplates();
  list.push({ id: 'c' + Date.now(), name, title, body });
  if (!adminSaveCustomTemplates(list)) { adminNotice('err', 'قالب ذخیره نشد؛ حافظه‌ی مرورگر پر است یا مرورگر اجازه نمی‌دهد. نام و متن در کادر مانده است.'); return; }
  nameEl.value = '';
  adminRenderTemplates();
  adminNotice('ok', '✅ قالب «' + name + '» ذخیره شد.');
}

// ---------- پیشنهاد کاربر هنگام تایپ در کادر شماره/نام ----------
function adminResolveUser(text) {
  const t = (text || '').trim();
  if (!t) return null;
  const users = adminUsers();
  const digits = normalizeDigits(t).replace(/\D/g, '');
  if (digits) { const byPhone = users.find(u => u.phone === digits); if (byPhone) return byPhone; }
  return users.find(u => String(u.username || '').toLowerCase() === t.toLowerCase()) || null;
}

function adminRenderSuggest() {
  const input = document.getElementById('adminMsgPhone');
  const box = document.getElementById('adminSuggBox');
  if (!input || !box) return;
  const q = input.value.trim();
  if (!q) { box.style.display = 'none'; return; }
  const list = adminFilterUsers(q).slice(0, 6);
  if (!list.length) { box.style.display = 'none'; return; }
  box.innerHTML = list.map(u => '<button type="button" data-pick="' + escapeHtml(u.phone) + '"><span class="uav" style="width:30px;height:30px;font-size:1rem">' + adminAvatarHtml(u) + '</span>'
    + '<span>' + escapeHtml(u.username || '—') + '</span><span class="ltr hint" style="margin-right:auto">' + escapeHtml(u.phone) + '</span></button>').join('');
  box.style.display = 'block';
}

// ---------- ارسال گروهی ----------
function adminMsgMode() {
  const s = document.getElementById('adminMsgTarget');
  return s ? s.value : 'single';
}
function adminTargetUsers(mode) {
  if (mode === 'all') return adminUsers();
  if (mode === 'picked') return adminUsers().filter(u => pickedPhones.has(u.phone));
  const input = document.getElementById('adminUserSearch');
  return adminFilterUsers(input ? input.value : '');
}
function adminUpdateTarget() {
  const mode = adminMsgMode();
  const wrap = document.getElementById('adminMsgPhoneWrap');
  if (wrap) wrap.style.display = mode === 'single' ? '' : 'none';
  const btn = document.getElementById('adminSendBtn');
  if (btn) btn.textContent = mode === 'single' ? 'ارسال به کادر «پیام از مدیریت»' : 'ارسال به ' + fa(adminTargetUsers(mode).length) + ' کاربر';
  const pc = document.getElementById('adminPickCount');
  if (pc) pc.textContent = pickedPhones.size ? fa(adminTargetUsers('picked').length) + ' کاربر تیک خورده' : '';
  adminRenderRecipient();
}

// کارت مشخصات گیرنده: وقتی پیام تکی است، همه‌ی اطلاعات کاربرِ انتخاب‌شده نشان داده می‌شود تا اشتباهی برای کسی ارسال نشود
function adminRenderRecipient() {
  const wrap = document.getElementById('adminMsgPhoneWrap');
  if (!wrap) return;
  let box = document.getElementById('adminMsgWho');
  if (!box) {
    box = document.createElement('div');
    box.id = 'adminMsgWho';
    box.setAttribute('aria-live', 'polite');
    wrap.parentNode.insertBefore(box, wrap.nextSibling);
  }
  const curMode = adminMsgMode();
  if (curMode === 'picked') {
    const sel = adminTargetUsers('picked');
    box.style.cssText = 'display:block;margin-top:10px;padding:12px 14px;border:1px solid var(--b);border-radius:12px;font-size:.88rem';
    if (!sel.length) { box.innerHTML = '<span style="color:#b45309">هنوز کاربری تیک نزده‌ای؛ در لیست «کاربران» بالا کنار هر کاربر که می‌خواهی تیک بزن.</span>'; return; }
    box.innerHTML = '<div style="color:var(--m);font-size:.78rem;margin-bottom:6px">پیام فقط برای این ' + fa(sel.length) + ' کاربر ارسال می‌شود (با ✕ می‌توانی برداری):</div>'
      + '<div class="chips">' + sel.map(u => '<span class="chip" style="cursor:default">' + escapeHtml(u.username || '—') + ' <span class="ltr hint">' + escapeHtml(u.phone) + '</span> <button type="button" data-unpick="' + escapeHtml(u.phone) + '" aria-label="برداشتن" style="background:none;border:0;cursor:pointer;color:inherit;font:inherit">✕</button></span>').join('') + '</div>';
    return;
  }
  if (curMode !== 'single') { box.style.display = 'none'; box.innerHTML = ''; return; }
  const input = document.getElementById('adminMsgPhone');
  const text = input ? input.value.trim() : '';
  box.style.cssText = 'display:block;margin-top:10px;padding:12px 14px;border:1px solid var(--b);border-radius:12px;font-size:.88rem';
  if (!text) { box.style.display = 'none'; box.innerHTML = ''; return; }
  const u = adminResolveUser(text);
  if (!u) {
    box.innerHTML = '<span style="color:#b45309">⚠️ کاربری با این شماره یا نام کاربری پیدا نشد؛ پیام ارسال نمی‌شود.</span>';
    return;
  }
  const books = Array.isArray(u.purchasedBooks) ? u.purchasedBooks.length : 0;
  const unread = adminUnreadCount(u);
  box.innerHTML = '<div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap">'
    + '<div class="uav">' + adminAvatarHtml(u) + '</div>'
    + '<div class="grow" style="min-width:200px"><div style="color:var(--m);font-size:.78rem">این پیام فقط برای همین یک کاربر ارسال می‌شود:</div>'
    + '<div><strong>' + escapeHtml(u.username || '—') + '</strong> <span class="ltr" style="display:inline-block">' + escapeHtml(u.phone) + '</span></div>'
    + '<small>' + fa(books) + ' کتاب خریداری‌شده' + (unread ? ' · ' + fa(unread) + ' پیام خوانده‌نشده' : '') + '</small></div></div>';
}

// یک بار خواندن و یک بار ذخیره برای همه‌ی گیرنده‌ها (نه یک‌به‌یک)؛ {نام} برای هر کاربر جدا جایگزین می‌شود
function adminBatchSend(phones, typedTitle, body) {
  const set = new Set(phones);
  const users = getUsersDatabase();
  const now = Date.now();
  let n = 0;
  users.forEach((u, i) => {
    if (!u || !set.has(u.phone)) return;
    const fill = s => String(s).split('{نام}').join(u.username || '');
    if (!Array.isArray(u.inbox)) u.inbox = [];
    u.inbox.unshift({
      id: 'm' + now + Math.random().toString(36).slice(2, 6) + i,
      ts: now,
      kind: 'qa',
      fa: { title: fill(typedTitle) || 'پیام از مدیریت', body: fill(body) },
      en: { title: fill(typedTitle) || 'Message from Management', body: fill(body) },
      read: false
    });
    if (u.inbox.length > 40) u.inbox.length = 40;
    n++;
  });
  if (!saveUsersDatabase(users)) return -1;   // مثلاً پر بودن حافظه‌ی مرورگر
  adminRefreshSession(users.find(u => currentActiveUser && u && u.phone === currentActiveUser.phone));
  return n;
}

function adminSendGroup(mode) {
  const titleEl = document.getElementById('adminMsgTitle');
  const bodyEl = document.getElementById('adminMsgBody');
  const body = bodyEl.value.trim();
  if (!body) { adminNotice('err', 'متن پیام را بنویسید.'); return; }
  const targets = adminTargetUsers(mode);
  if (!targets.length) { adminNotice('err', 'کاربری برای ارسال پیدا نشد.'); return; }
  const what = mode === 'all' ? 'همه‌ی کاربران' : (mode === 'picked' ? 'کاربران تیک‌خورده' : 'نتیجه‌ی جستجوی فعلی');
  const names = mode === 'picked' ? '\n\n' + targets.slice(0, 10).map(u => '• ' + (u.username || '—') + ' (' + u.phone + ')').join('\n') + (targets.length > 10 ? '\n… و ' + fa(targets.length - 10) + ' نفر دیگر' : '') : '';
  if (!confirm('این پیام برای ' + fa(targets.length) + ' کاربر (' + what + ') ارسال شود؟' + names + '\nبعد از ارسال قابل پس‌گرفتن نیست.')) return;
  const n = adminBatchSend(targets.map(u => u.phone), titleEl.value.trim(), body);
  if (n < 0) { adminNotice('err', ADM_SAVE_FAIL + ' متن پیام در کادر مانده است.'); return; }
  bodyEl.value = '';
  titleEl.value = '';
  if (mode === 'picked') pickedPhones.clear();   // تیک‌ها پاک می‌شود تا پیام دوباره برای همان‌ها نرود
  adminRenderAll();
  adminNotice('ok', '✅ پیام برای ' + fa(n) + ' کاربر ارسال شد.');
}

// ارسال پیام یا پاسخ پرسش از طرف مدیریت به کادر «پیام از مدیریت» یک کاربر
function adminSendInboxMessage() {
  const mode = adminMsgMode();
  if (mode !== 'single') { adminSendGroup(mode); return; }
  const phoneEl = document.getElementById('adminMsgPhone');
  const titleEl = document.getElementById('adminMsgTitle');
  const bodyEl = document.getElementById('adminMsgBody');
  const typedTitle = titleEl.value.trim();
  const body = bodyEl.value.trim();
  if (!phoneEl.value.trim() || !body) {
    adminNotice('err', 'شماره (یا نام کاربری) و متن پیام را وارد کنید.');
    return;
  }
  const user = adminResolveUser(phoneEl.value);
  if (!user) {
    adminNotice('err', 'کاربری با این شماره یا نام کاربری روی این مرورگر پیدا نشد.');
    return;
  }
  const fill = s => String(s).split('{نام}').join(user.username || '');
  // اگر عنوانی نوشته نشود، عنوان پیش‌فرض به زبان هر کاربر نمایش داده می‌شود
  const ok = sendInboxMessage(user.phone, {
    kind: 'qa',
    fa: { title: fill(typedTitle) || 'پیام از مدیریت', body: fill(body) },
    en: { title: fill(typedTitle) || 'Message from Management', body: fill(body) }
  });
  if (!ok) {
    adminNotice('err', ADM_SAVE_FAIL + ' متن پیام در کادر مانده است و پیامی ارسال نشد.');
    return;
  }
  adminRefreshSession(getUsersDatabase().find(u => u.phone === user.phone));
  bodyEl.value = '';
  titleEl.value = '';
  phoneEl.value = '';
  adminRenderAll();
  adminRenderRecipient();
  adminNotice('ok', '✅ پیام برای «' + (user.username || user.phone) + '» ارسال شد.');
}

document.addEventListener('DOMContentLoaded', function () {
  adminRenderAll();
  adminRenderTemplates();

  const list = document.getElementById('adminPendingList');
  if (list) {
    list.addEventListener('click', function (ev) {
      const zoom = ev.target.closest('img[data-zoom]');
      if (zoom) { adminOpenLightbox(zoom.getAttribute('data-zoom')); return; }
      const btn = ev.target.closest('button[data-act]');
      if (!btn) return;
      const phone = btn.getAttribute('data-phone');
      if (btn.getAttribute('data-act') === 'approve') adminApproveAvatar(phone);
      else adminRejectAsk([phone]);
    });
    list.addEventListener('change', function (ev) {
      if (ev.target.classList.contains('pend-chk')) adminUpdateBulkCount();
    });
  }
  const all = document.getElementById('adminPendAll');
  if (all) all.addEventListener('change', function () {
    document.querySelectorAll('.pend-chk').forEach(c => { c.checked = all.checked; });
    adminUpdateBulkCount();
  });
  const bA = document.getElementById('adminBulkApprove');
  if (bA) bA.addEventListener('click', () => adminBulk('approve'));
  const bR = document.getElementById('adminBulkReject');
  if (bR) bR.addEventListener('click', () => adminBulk('reject'));

  // پیش‌نمایش بزرگ
  const lb = document.getElementById('admLightbox');
  if (lb) {
    lb.addEventListener('click', ev => { if (ev.target === lb) adminCloseLightbox(); });
    document.getElementById('admLbClose').addEventListener('click', adminCloseLightbox);
    document.getElementById('admLbApprove').addEventListener('click', () => { const p = lbPhone; adminCloseLightbox(); if (p) adminApproveAvatar(p); });
    document.getElementById('admLbReject').addEventListener('click', () => { const p = lbPhone; adminCloseLightbox(); if (p) adminRejectAsk([p]); });
    document.addEventListener('keydown', ev => { if (ev.key === 'Escape') adminCloseLightbox(); });
  }

  // جستجوی کاربران
  const search = document.getElementById('adminUserSearch');
  if (search) search.addEventListener('input', () => { userShown = USER_PAGE; adminRenderUsers(); adminUpdateTarget(); });
  const target = document.getElementById('adminMsgTarget');
  if (target) target.addEventListener('change', adminUpdateTarget);
  const more = document.getElementById('adminUserMore');
  if (more) more.addEventListener('click', () => { userShown += USER_PAGE; adminRenderUsers(); });
  const ulist = document.getElementById('adminUserList');
  if (ulist) ulist.addEventListener('change', function (ev) {
    const cb = ev.target.closest('input[data-pick-user]');
    if (!cb) return;
    const ph = cb.getAttribute('data-pick-user');
    if (cb.checked) pickedPhones.add(ph); else pickedPhones.delete(ph);
    const tsel = document.getElementById('adminMsgTarget');
    if (cb.checked && tsel && tsel.value !== 'picked') tsel.value = 'picked';   // تیک‌زدن یعنی «فقط برای تیک‌خورده‌ها»
    adminUpdateTarget();
  });
  const pickAll = document.getElementById('adminPickAll');
  if (pickAll) pickAll.addEventListener('click', () => {
    adminFilterUsers((document.getElementById('adminUserSearch') || {}).value || '').forEach(u => pickedPhones.add(u.phone));
    const tsel = document.getElementById('adminMsgTarget'); if (tsel) tsel.value = 'picked';
    adminRenderUsers(); adminUpdateTarget();
  });
  const pickNone = document.getElementById('adminPickNone');
  if (pickNone) pickNone.addEventListener('click', () => { pickedPhones.clear(); adminRenderUsers(); adminUpdateTarget(); });
  const whoBox = document.getElementById('adminMsgCard');
  if (whoBox) whoBox.addEventListener('click', function (ev) {
    const x = ev.target.closest('button[data-unpick]');
    if (!x) return;
    pickedPhones.delete(x.getAttribute('data-unpick'));
    adminRenderUsers(); adminUpdateTarget();
  });
  if (ulist) ulist.addEventListener('click', function (ev) {
    const b = ev.target.closest('button[data-msg]');
    if (!b) return;
    // «پیام» کنار یک کاربر یعنی فقط برای همان کاربر: حالت گیرنده را تکی کن، شماره را بنویس و مشخصاتش را نشان بده
    const tsel = document.getElementById('adminMsgTarget');
    if (tsel) tsel.value = 'single';
    document.getElementById('adminMsgPhone').value = b.getAttribute('data-msg');
    document.getElementById('adminSuggBox').style.display = 'none';
    adminUpdateTarget();
    const card = document.getElementById('adminMsgCard');
    if (card) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    document.getElementById('adminMsgBody').focus({ preventScroll: true });
  });

  // قالب‌ها
  const tpl = document.getElementById('adminTplList');
  if (tpl) tpl.addEventListener('click', function (ev) {
    const del = ev.target.closest('[data-tpl-del]');
    if (del) {
      const id = del.getAttribute('data-tpl-del');
      if (!adminSaveCustomTemplates(adminCustomTemplates().filter(t => t.id !== id))) { adminNotice('err', 'قالب حذف نشد؛ حافظه‌ی مرورگر اجازه‌ی ذخیره نمی‌دهد.'); return; }
      adminRenderTemplates();
      return;
    }
    const chip = ev.target.closest('[data-tpl]');
    if (chip) adminApplyTemplate(chip.getAttribute('data-tpl'));
  });
  const saveTpl = document.getElementById('adminTplSave');
  if (saveTpl) saveTpl.addEventListener('click', adminSaveTemplate);

  // پیشنهاد کاربر در کادر پیام
  const phone = document.getElementById('adminMsgPhone');
  if (phone) {
    phone.addEventListener('input', adminRenderSuggest);
    phone.addEventListener('input', adminRenderRecipient);
    phone.addEventListener('focus', adminRenderSuggest);
    document.addEventListener('click', ev => {
      if (!ev.target.closest('.sugg')) document.getElementById('adminSuggBox').style.display = 'none';
    });
  }
  const sbox = document.getElementById('adminSuggBox');
  if (sbox) sbox.addEventListener('click', function (ev) {
    const b = ev.target.closest('button[data-pick]');
    if (!b) return;
    phone.value = b.getAttribute('data-pick');
    sbox.style.display = 'none';
    adminRenderRecipient();
  });

  const send = document.getElementById('adminSendBtn');
  if (send) send.addEventListener('click', adminSendInboxMessage);
});
