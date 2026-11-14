/* Аудит смешения языков по книге Картари (Playwright WebKit, iPhone 13).
 *
 * Обходит: обложку, Текст, каждую главу, Гравюры и все карточки гравюр, Указатель, Имена и карточки имён
 * (выборка), Поиск с запросом, шторки (содержание, поиск, «Найти», «Тип»), просмотр сканов (Скан/Транскрипция),
 * экран загрузки. Ищет:
 *   EN/FR: кириллицу (видимый текст, aria-label, title, placeholder, alt, value) и строки интерфейса другого языка;
 *   RU:    английские/французские строки интерфейса (из словаря app.js) и «латинские» пробеги в видимом тексте.
 * Исключения: курсив (em/i) в тексте глав — итальянские цитаты; названия «Tavola delle cose notabili», «Chronicum Chronicorum»; всё внутри [lang="it"/"la"], .ic-sv-it, .ic-pc-it, .ic-nm-it (итальянские цитаты и оригинальные названия),
 * переключатель RU/EN/FR.
 *
 * Запуск (из корня репозитория; сайт отдаётся на BASE):
 *   python3 -m http.server 8950 &
 *   cd tools/playwright-check && BASE=http://localhost:8950/index.html node check_languages.js
 * Переменные: LANGS=ru,en,fr  PLATES=all|N (сколько карточек гравюр, по умолчанию все)  NAMES=50  SEED=7
 *             QUERY=Юнона (поисковый запрос)  OUT=report.json
 * Код выхода: 0 — находок нет, 1 — есть находки.
 */
const { webkit, devices } = require('playwright');
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const BASE = process.env.BASE || 'http://localhost:8950/index.html';
const LANGS = (process.env.LANGS || 'ru,en,fr').split(',');
const NNAMES = +(process.env.NAMES || 50), SEED = +(process.env.SEED || 7);
const NPLATES = process.env.PLATES && process.env.PLATES !== 'all' ? +process.env.PLATES : Infinity;
const QUERY = { ru: 'Юнона', en: 'Juno', fr: 'Junon' };
const BOOK = path.join(ROOT, 'books', 'cartari');
const J = f => JSON.parse(fs.readFileSync(path.join(BOOK, f), 'utf8'));

// ---- словарь интерфейса из app.js: key: {ru:"..", en:"..", fr:".."} ----
const appSrc = fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8');
const dict = [];
const re = /^\s*(\w+):\s*\{ru:"((?:[^"\\]|\\.)*)",\s*en:"((?:[^"\\]|\\.)*)",\s*fr:"((?:[^"\\]|\\.)*)"/gm;
for (let m; (m = re.exec(appSrc));) dict.push({ key: m[1], ru: m[2], en: m[3], fr: m[4] });
const norm = s => s.replace(/\\"/g, '"').replace(/\\'/g, "'").replace(/…$/, '').trim();
const uiByLang = {};
for (const l of ['ru', 'en', 'fr']) uiByLang[l] = new Set(dict.map(d => norm(d[l]).toLowerCase()).filter(s => s.length >= 3));
// «чужие» строки интерфейса для языка L: значения других языков, которых нет среди значений L и без плейсхолдеров
function foreignStrings(L) {
  const out = [];
  for (const o of ['ru', 'en', 'fr']) {
    if (o === L) continue;
    for (const d of dict) {
      const s = norm(d[o]);
      if (s.length < 4 || /[{}]/.test(s) || uiByLang[L].has(s.toLowerCase())) continue;
      if (o !== 'ru' && L !== 'ru' && /^(index|scan|plate|text|ok)$/i.test(s)) continue;
      out.push({ s: s.toLowerCase(), key: d.key, from: o });
    }
  }
  return out;
}

// ---- что собирать на странице (выполняется в браузере) ----
const COLLECT = `(function(L, FOREIGN){
  var SKIP = '[lang="it"],[lang="la"],.ic-sv-it,.ic-pc-it,.ic-nm-it,#back-bar-lang,.ic-lang,script,style,noscript';
  var CYR = /[А-Яа-яЁё]/, LAT = /[A-Za-z]{3,}(?:[\\s,.;:'’-]+[A-Za-z]{3,})+/;
  var out = [];
  function sel(el){ var s = el.tagName.toLowerCase(); if(el.id) s += '#'+el.id; else if(el.className && typeof el.className==='string') s += '.'+el.className.trim().split(/\\s+/).slice(0,2).join('.'); return s; }
  function vis(el){ if(!el.getClientRects().length) return false; var cs = getComputedStyle(el); return cs.visibility !== 'hidden' && cs.display !== 'none'; }
  function check(kind, text, el){
    if(!text) return; var t = text.replace(/\\s+/g,' ').trim(); if(!t) return;
    if(L !== 'ru' && CYR.test(t)) out.push({kind:'cyrillic-'+kind, text:t.slice(0,120), el:sel(el)});
    var tl = t.replace(/Tavola delle cose notabili|Chronicum Chronicorum/g,'');
    if(L === 'ru' && LAT.test(tl) && !(el.closest('em,i,cite') && el.closest('.ic-text'))) out.push({kind:'latin-'+kind, text:t.slice(0,120), el:sel(el)});
    var low = t.toLowerCase().replace(/…$/,'');
    for(var i=0;i<FOREIGN.length;i++){ var f = FOREIGN[i]; if(low === f.s || (f.s.length >= 8 && /\\s/.test(f.s) && low.indexOf(f.s) >= 0)){ out.push({kind:'foreign-ui('+f.from+')', text:t.slice(0,120), el:sel(el), key:f.key}); break; } }
  }
  var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT), n;
  while((n = w.nextNode())){
    var p = n.parentElement; if(!p || p.closest(SKIP) || !vis(p)) continue;
    check('text', n.nodeValue, p);
  }
  document.querySelectorAll('[aria-label],[title],[placeholder],img[alt],input[value],[aria-description]').forEach(function(el){
    if(el.closest(SKIP)) return;
    ['aria-label','title','placeholder','alt','aria-description'].forEach(function(a){ var v = el.getAttribute(a); if(v) check(a, v, el); });
    if(el.tagName === 'INPUT' && el.type !== 'hidden' && el.value) check('value', el.value, el);
  });
  return out;
})`;

// ---- маршруты ----
function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const rnd = mulberry(SEED);
const chapters = J('chapters_ru.json').chapters.map(c => c.slug);
let plates = J('plates.json').plates.map(p => p.id);
if (plates.length > NPLATES) plates = plates.filter(() => rnd() < NPLATES / plates.length);
const names = J('names.json').names.map(n => n.id).sort(() => rnd() - .5).slice(0, NNAMES);
const R = h => BASE + '#/cartari' + (h ? '/' + h : '');
const pages = [
  ['cover', R('')], ['text', R('text')], ['plates', R('plates')], ['index', R('index')], ['names', R('names')], ['search', R('search')],
  ...chapters.map(c => ['ch/' + c, R('ch/' + c)]),
  ...plates.map(i => ['plate/' + i, R('plate/' + i)]),
  ...names.map(i => ['names/' + i, R('names/' + i)]),
];

(async () => {
  const browser = await webkit.launch();
  const all = [], consoleErrs = [];
  const seen = new Set();
  const add = (L, where, items) => items.forEach(f => { const k = [L, f.kind, f.text, f.el].join('|'); if (!seen.has(k)) { seen.add(k); all.push({ lang: L, where, ...f }); } });
  for (const L of LANGS) {
    const FOREIGN = foreignStrings(L);
    const ctx = await browser.newContext({ ...devices['iPhone 13'] });
    await ctx.addInitScript(l => { try { localStorage.setItem('ic-lang', l); } catch (e) {} }, L);
    const page = await ctx.newPage();
    page.on('console', m => { if (m.type() === 'error') consoleErrs.push(L + ': ' + m.text().slice(0, 160)); });
    page.on('pageerror', e => consoleErrs.push(L + ' PE: ' + e.message.slice(0, 160)));
    const grab = async where => add(L, where, await page.evaluate(`${COLLECT}(${JSON.stringify(L)}, ${JSON.stringify(FOREIGN)})`));
    const settle = ms => page.waitForTimeout(ms);
    const press = async sel => { try { await page.click(sel, { timeout: 1500 }); return true; } catch (e) { return false; } };

    // экран загрузки: медленная отдача данных книги, снимок пока он на экране
    await page.route('**/books/cartari/**', async r => { await new Promise(s => setTimeout(s, 900)); r.continue().catch(() => {}); });
    for (const h of ['', 'index', 'names', 'ch/' + chapters[1]]) {
      await page.goto('about:blank'); await page.goto(R(h)); await settle(350);
      if (await page.$('.ic-loading')) await grab('loading ' + (h || 'cover')); else add(L, 'loading ' + h, [{ kind: 'note', text: 'экран загрузки не пойман', el: '' }]);
    }
    await page.unroute('**/books/cartari/**');

    for (const [name, url] of pages) {
      await page.goto(url); await page.waitForSelector('.ic-wrap, .ic-ch-outer', { timeout: 8000 }).catch(() => {}); await settle(name.startsWith('plate/') || name.startsWith('names/') ? 250 : 600);
      await grab(name);
      if (name === 'cover' || name === 'text' || name === 'plates' || name === 'search') {
        // поиск (шторка меню книги): открыть, ввести запрос
        if (await press('[data-rb="booksearch"]')) {
          await settle(500); await page.fill('#ic-rb-sheet input.ic-search', QUERY[L]).catch(() => {}); await page.keyboard.press('Enter'); await settle(1500);
          await grab(name + ' [шторка поиска + запрос]'); await press('[data-rb="booksearch"]'); await settle(300);
        }
      }
      if (name === 'search') {
        await page.fill('.ic-wrap input.ic-search', QUERY[L]).catch(() => {}); await page.keyboard.press('Enter'); await settle(1500); await grab('search [запрос]');
      }
      if (name === 'ch/' + chapters[1] || name === 'ch/' + chapters[10]) {
        if (await press('[data-rb="pos"]')) { await settle(700); await grab(name + ' [шторка содержания]'); await page.keyboard.press('Escape'); await settle(400); }
        if (await press('[data-rb="scan"]')) {
          await settle(1200); await grab(name + ' [просмотр сканов: Скан]');
          if (await press('.ic-svx-sw [data-m="it"]')) { await settle(900); await grab(name + ' [просмотр сканов: Транскрипция]'); }
          await press('.ic-svx-back'); await settle(400);
        }
      }
      if (name === 'index' || name === 'names') {
        if (await press('[data-rb="search"]')) { await settle(500); await grab(name + ' [шторка «Найти»]'); await press('[data-rb="search"]'); await settle(300); }
        if (name === 'names' && await press('[data-rb="type"]')) { await settle(500); await grab('names [шторка «Тип»]'); await page.keyboard.press('Escape'); await settle(300); }
      }
    }
    await ctx.close();
  }
  await browser.close();
  const by = {};
  all.filter(f => f.kind !== 'note').forEach(f => { const k = f.lang + ' ' + f.kind; by[k] = (by[k] || 0) + 1; });
  const notes = all.filter(f => f.kind === 'note');
  const finds = all.filter(f => f.kind !== 'note');
  if (process.env.OUT) fs.writeFileSync(process.env.OUT, JSON.stringify({ by, finds, notes, consoleErrs }, null, 1));
  console.log('страниц на язык:', pages.length, '| шаблон строк интерфейса:', dict.length);
  console.log('находки по типам:', JSON.stringify(by));
  finds.slice(0, 80).forEach(f => console.log(`  [${f.lang}] ${f.kind} @ ${f.where} <${f.el}> «${f.text}»${f.key ? ' key=' + f.key : ''}`));
  if (finds.length > 80) console.log('  … ещё', finds.length - 80, '(см. OUT)');
  notes.forEach(f => console.log('  note', f.lang, f.where, f.text));
  console.log('ошибки консоли:', consoleErrs.length ? consoleErrs : 'нет');
  console.log('ИТОГО находок:', finds.length);
  process.exit(finds.length || consoleErrs.length ? 1 : 0);
})();
