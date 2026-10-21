// بررسی می‌کند منطق مسابقه در هر سه فایل (app-index.js، app-author.js، ../admin-users.js) یکسان باشد.
// اگر تابعی در یکی از فایل‌ها تغییر کند و در بقیه نکند، این بررسی خطا می‌دهد.
const fs = require('fs');
const files = { index: 'app-index.js', author: 'app-author.js', admin: '../admin-users.js' };
const FUNCS = ['gregorianToJalali', 'getTehranYmd', 'getJalaliMonthKey', 'getJalaliMonthKeyFromDayKey', 'addDaysToDate', 'addMonthsToKey', 'isLastDayOfMonth', 'isLastDayOfDayKey', 'getContestPeriodKey',
  'getCurrentMonthKey', 'getContestDaysLeft', 'getAdjacentMonthKey', 'getUserMonthlyDetail', 'levelVals',
  'getEligibleContenders', 'computeCompetition', 'finalizeMonthlyChampion', 'buildPodium', 'computeRecordFlags',
  'applyContestPrizes', 'generateVoucherCode', 'buildPrizeLines', 'buildWinnerMessage', 'buildPodiumMessage', 'buildExcludedMessage',
  'readGiftPool', 'writeGiftPool', 'readChampions', 'writeChampions'];
function norm(t) { return t.split('\n').map(l => l.trim()).filter(Boolean).join('\n'); }
function grabFunc(src, name) {
  const m = new RegExp('(?:async\\s+)?function\\s+' + name + '\\s*\\(').exec(src);
  if (!m) return null;
  let i = src.indexOf('{', m.index), depth = 0, j = i;
  for (; j < src.length; j++) {
    const c = src[j];
    if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) break; }
  }
  return norm(src.slice(m.index, j + 1));
}
function grabConst(src, name) {
  const m = new RegExp('const\\s+' + name + '\\s*=').exec(src);
  if (!m) return null;
  const end = src.indexOf(';', src.indexOf(']', m.index));
  return norm(src.slice(m.index, end + 1));
}
const srcs = {};
for (const k in files) srcs[k] = fs.readFileSync(files[k], 'utf8');
let bad = 0;
const items = FUNCS.map(n => [n, s => grabFunc(s, n)]).concat([['CONTEST_PRIZES', s => grabConst(s, 'CONTEST_PRIZES')]]);
for (const [name, get] of items) {
  const v = {};
  for (const k in srcs) v[k] = get(srcs[k]);
  const ref = v.index;
  for (const k of ['author', 'admin']) {
    if (v[k] !== ref) { console.log('❌ ناهماهنگ: ' + name + ' (index ↔ ' + k + ')'); bad++; }
  }
}
if (bad) { console.log('منطق مسابقه بین فایل‌ها یکسان نیست: ' + bad + ' مورد'); process.exit(1); }
console.log('منطق مسابقه در هر سه فایل یکسان است.');

// منطق «تخفیفات ویژه» و سبد خرید فقط باید بین app-index.js و app-author.js یکسان باشد (ادمین ندارد)
const DEAL_FUNCS = ['dealRng', 'getSpecialDealsCount', 'dealQualityMap', 'buildSpecialDealIds', 'dealPercentFor', 'getUserActivityPoints',
  'getSpecialDealsForUser', 'invalidateSpecialDealsCache', 'getBookDeal', 'bookPayPrice', 'dealPriceHtml', 'refreshDealViews',
  'addToCart', 'applyCartVoucher', 'renderCartModalContent', 'checkoutCart'];
let bad2 = 0;
for (const n of DEAL_FUNCS) {
  if (grabFunc(srcs.index, n) !== grabFunc(srcs.author, n)) { console.log('❌ ناهماهنگ (تخفیفات ویژه/سبد): ' + n + ' (index ↔ author)'); bad2++; }
}
for (const c of ['SPECIAL_DEALS_COUNT', 'SPECIAL_DEALS_MAX_SHARE', 'SPECIAL_DEAL_MIN_PCT', 'SPECIAL_DEAL_MAX_PCT', 'SPECIAL_DEALS_SALT', 'SPECIAL_DEALS_LEVEL_SWAP', 'SPECIAL_DEALS_LEVEL_POINTS']) {
  const re = new RegExp('const\\s+' + c + '\\s*=[^\\n]*');
  const a = (re.exec(srcs.index) || [''])[0].replace(/\s+/g, ' '), b = (re.exec(srcs.author) || [''])[0].replace(/\s+/g, ' ');
  if (!a || a !== b) { console.log('❌ ناهماهنگ (ثابت تخفیفات ویژه): ' + c); bad2++; }
}
if (bad2) { console.log('منطق تخفیفات ویژه/سبد بین index و author یکسان نیست: ' + bad2 + ' مورد'); process.exit(1); }
console.log('منطق تخفیفات ویژه و سبد خرید در index و author یکسان است.');
