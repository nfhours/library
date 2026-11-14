/* Автотест «Иконологии» Рипы (Playwright WebKit, iPhone 13).
 * Проверяет поведение: поиск (сюжет, предмет, слово), фильтр по частям, сортировку, счётчик «Найдено»,
 * переход в статью и «назад» (с позицией), пред./след., прямую ссылку #/iconologie/p1-N, скан/текст, RU/EN/FR.
 *
 * Запуск (из корня репозитория, сайт отдаётся на BASE):
 *   python3 -m http.server 8950 &
 *   cd tools/playwright-check && OLD=1 BASE=http://localhost:8950/index.html node check_ripa.js    # прежний вид (?old)
 *   cd tools/playwright-check && BASE=http://localhost:8950/index.html node check_ripa.js                                      # основной (новый) вид
 * Старый вид пишет out/ripa-baseline.json; новый сравнивает свои числа с ним.
 * Код выхода: 0 — всё прошло, 1 — есть расхождения.
 */
const { webkit, devices } = require('playwright');
const fs = require('fs'), path = require('path');
const NEW = !process.env.OLD;   // основной вид без флага; OLD=1 — прежний вид по ?old
const BASE = process.env.BASE || 'http://localhost:8950/index.html';
const URL0 = BASE + (NEW ? '' : '?old');
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const BASEFILE = path.join(OUT, 'ripa-baseline.json');
const res = {}, fails = [], errs = [];
const ok = (name, cond, info) => { if (!cond) fails.push(name + (info !== undefined ? ' :: ' + JSON.stringify(info) : '')); };
const LIST = NEW ? '#/iconologie/list' : '#/iconologie';
const W = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const br = await webkit.launch();
  const ctx = await br.newContext({ ...devices['iPhone 13'] });
  const page = await ctx.newPage();
  const benign = t => /access control checks|Load failed|cancelled/i.test(t); // fetch, оборванный перезагрузкой страницы
  page.on('console', m => { if (m.type() === 'error' && !benign(m.text())) errs.push(m.text()); });
  page.on('pageerror', e => { if (!benign(e.message)) errs.push('pageerror: ' + e.message); });
  const open = async (hash, lang) => {
    await page.goto(URL0 + (hash || ''), { waitUntil: 'load' });
    if (lang) { await page.evaluate(l => { localStorage.setItem('ic-lang', l); }, lang); await page.reload({ waitUntil: 'load' }); }
    await W(500);
  };
  const rows = () => page.$$eval('.ic-row-item', els => els.length);
  const titles = n => page.$$eval('.ic-row-item', (els, n) => els.slice(0, n).map(e => e.getAttribute('data-id')), n);
  const countNum = async () => {
    const t = await page.$eval('.ic-count', e => e.textContent).catch(() => '');
    const m = /(\d+)/.exec(t); return m ? +m[1] : 0;
  };
  // --- адаптеры (старый/новый вид) ---
  const A = {
    async search(q) {
      if (!NEW) {
        await page.evaluate(q => { const i = document.querySelector('.ic-wrap input.ic-search'); i.value = q; i.dispatchEvent(new Event('input', { bubbles: true })); }, q);
      } else {
        await page.evaluate(q => { const i = document.querySelector('.ic-rbar-findin'); i.value = q; i.dispatchEvent(new Event('input', { bubbles: true })); }, q);
      }
      await W(300);
    },
    async clear() { await A.search(''); },
    async loupe(q) { // только новый вид: лупа ищет по всему тексту
      await page.evaluate(q => { const i = document.querySelector('#ic-rb-sheet input.ic-search'); i.value = q; i.dispatchEvent(new Event('input', { bubbles: true })); }, q);
      await W(500);
      return page.$$eval('#ic-rb-sheet .ic-sr-a', els => els.map(e => e.getAttribute('data-id')));
    },
    async part(v) { // 'all' | '1' | '2'
      await page.evaluate(v => { document.querySelector('[data-f="' + v + '"]').click(); }, v); await W(300);
    },
    async sort(v) { // 'book' | 'ru' | 'page'
      if (!NEW) { await page.selectOption('.ic-sort', v); }
      else { await page.evaluate(v => { document.querySelector('[data-sort-opt="' + v + '"]').click(); }, v); }
      await W(300);
    },
    async backCtl() { await page.click(NEW ? '.ic-bt-back' : '.ic-back'); await W(700); },
  };

  // 1. Список: общий счёт, счётчик
  await open(LIST, 'ru');
  await page.waitForSelector('.ic-row-item');
  res.total = await rows(); ok('list rows 440', res.total === 440, res.total);
  res.countText = await page.$eval('.ic-count', e => e.textContent); ok('count visible', NEW ? res.countText === '' : /440/.test(res.countText), res.countText);

  // 2. Поиск: сюжет (название, RU и FR), предмет (атрибут), слово из текста
  const queries = { title_ru: 'Изобилие', title_fr: 'Abondance', subject: 'венке', word: 'зеркал' };
  res.search = {};
  for (const [k, q] of Object.entries(queries)) {
    await A.search(q);
    const n = await rows(), c = await countNum();
    res.search[k] = { n, c, first: await titles(3) };
    ok('search ' + k + ' > 0', n > 0, n); ok('search ' + k + ' count==rows', n === c, [n, c]);
  }
  if (NEW) {
    // «Найти» — только названия и предметы; лупа — весь текст (числа лупы = числам прежнего общего поиска)
    const base0 = fs.existsSync(BASEFILE) ? JSON.parse(fs.readFileSync(BASEFILE, 'utf8')) : null;
    res.loupe = {};
    for (const [k, q] of Object.entries(queries)) {
      const ids = await A.loupe(q); res.loupe[k] = ids.length;
      if (base0) ok('loupe ' + k + ' == baseline', ids.length === Math.min(60, base0.search[k].n), [ids.length, base0.search[k].n]);
      if (base0) ok('find ' + k + ' <= baseline', res.search[k].n <= base0.search[k].n, [res.search[k].n, base0.search[k].n]);
    }
    ok('find word(text) narrower than loupe', res.search.word.n < res.loupe.word, [res.search.word.n, res.loupe.word]);
    ok('find title_ru > 0', res.search.title_ru.n > 0);
  }
  await A.search('ъъъъъъ'); res.searchEmpty = await rows(); ok('empty search 0 rows', res.searchEmpty === 0);
  await A.clear(); ok('cleared back to 440', (await rows()) === 440);

  // 3. Фильтр по частям
  res.part = {};
  for (const v of ['1', '2', 'all']) { await A.part(v); res.part[v] = { n: await rows(), c: await countNum() }; if (NEW && v === 'all') res.part[v].c = res.part[v].n; ok('part ' + v + ' n==c', res.part[v].n === res.part[v].c, res.part[v]); }
  ok('parts sum', res.part['1'].n + res.part['2'].n === 440, res.part);
  ok('part all=440', res.part.all.n === 440);

  // 4. Сортировка
  res.sort = {};
  for (const v of ['ru', 'page', 'book']) { await A.sort(v); res.sort[v] = await titles(6); }
  ok('sort differ ru/book', JSON.stringify(res.sort.ru) !== JSON.stringify(res.sort.book), res.sort);
  ok('sort differ page/ru', JSON.stringify(res.sort.page) !== JSON.stringify(res.sort.ru), res.sort);

  // 5. Переход в статью и «назад» с позицией
  await A.sort('book');
  await page.evaluate(() => window.scrollTo(0, 3000)); await W(400);
  const y0 = await page.evaluate(() => scrollY);
  const rid = await page.evaluate(() => { const e = [...document.querySelectorAll('.ic-row-item')].find(e => e.getBoundingClientRect().top > 220); e.click(); return e.getAttribute('data-id'); });
  await W(900);
  res.openedHash = await page.evaluate(() => location.hash); ok('open article hash', res.openedHash === '#/iconologie/' + rid, res.openedHash);
  res.h1 = await page.$eval('h1', e => e.textContent); ok('article h1', !!res.h1);
  res.articleScrollTop = await page.evaluate(() => scrollY); ok('article opens at top', res.articleScrollTop < 5, res.articleScrollTop);
  await A.backCtl();
  res.backHash = await page.evaluate(() => location.hash); ok('back ctl -> list', NEW ? res.backHash === '#/iconologie/list' : /^#\/iconologie\/?$/.test(res.backHash), res.backHash);
  res.backY = await page.evaluate(() => scrollY); res.backDelta = Math.abs(res.backY - y0);
  ok('back restores scroll', NEW ? res.backDelta <= 12 : res.backDelta < 600, { y0, backY: res.backY });
  // браузерное «назад»
  await page.evaluate(r => { document.querySelector('.ic-row-item[data-id="' + r + '"]').click(); }, rid); await W(700);
  await page.goBack(); await W(700);
  res.goBackY = await page.evaluate(() => scrollY); ok('browser back restores', NEW ? Math.abs(res.goBackY - y0) <= 12 : Math.abs(res.goBackY - y0) < 600, { y0, y: res.goBackY });

  // 6. Пред./След. (в самой статье)
  await open('#/iconologie/p1-5', 'ru'); await page.waitForSelector('h1');
  res.p1_5 = await page.$eval('h1', e => e.textContent);
  const go = async sel => { await page.evaluate(s => document.querySelector(s).click(), sel); await W(700); return page.evaluate(() => location.hash); };
  const nextSel = NEW ? '[data-nav="next"]' : '.ic-nav-pager-b:nth-child(2)', prevSel = NEW ? '[data-nav="prev"]' : '.ic-nav-pager-b:nth-child(1)';
  res.next = await go(nextSel); ok('next -> p1-6', res.next === '#/iconologie/p1-6', res.next);
  res.prev = await go(prevSel); ok('prev -> p1-5', res.prev === '#/iconologie/p1-5', res.prev);
  // нижний переход к соседям
  const bn = await page.evaluate(() => document.querySelector('.ic-pager button:nth-child(2)') ? document.querySelector('.ic-pager button:nth-child(2)').getAttribute('data-go') || document.querySelector('.ic-pager button:nth-child(2)').getAttribute('href') : null);
  ok('bottom pager next exists', !!bn, bn);

  // 7. Прямая ссылка
  await open('#/iconologie/p2-123', 'ru'); await page.waitForSelector('h1');
  res.direct = { hash: await page.evaluate(() => location.hash), h1: await page.$eval('h1', e => e.textContent) };
  ok('direct link h1', /Docilit/.test(res.direct.h1), res.direct);
  // 8. Скан/текст
  await open('#/iconologie/p1-5', 'ru'); await page.waitForSelector('h1');
  const hasOrig = await page.evaluate(() => !!document.querySelector('.ic-original'));
  if (NEW) {
    await page.evaluate(() => document.querySelector('[data-rb="scan"]').click()); await W(500);
  }
  await page.evaluate(() => { const d = document.querySelector('.ic-original'); if (d) { d.open = true; d.dispatchEvent(new Event('toggle')); } }); await W(800);
  res.scanOrig = hasOrig;
  const hasScanImg = await page.evaluate(() => !!document.querySelector('.ic-orig-view[data-view="scan"] img'));
  ok('scan image', hasScanImg);
  await page.evaluate(() => document.querySelector('.ic-ov-b[data-view="text"]').click()); await W(400);
  const frText = await page.evaluate(() => (document.querySelector('.ic-orig-view[data-view="text"]') || {}).textContent || '');
  ok('fr text shown', frText.length > 50, frText.length);
  await page.evaluate(() => document.querySelector('.ic-ov-b[data-view="scan"]').click()); await W(400);
  ok('back to scan', await page.evaluate(() => !!document.querySelector('.ic-orig-view[data-view="scan"] img')));

  // 9. RU/EN/FR
  res.lang = {};
  for (const L of ['en', 'fr', 'ru']) {
    await page.evaluate(l => { const b = document.querySelector('.ic-lang-b[data-lang="' + l + '"]') || [...document.querySelectorAll('.ic-lang button, .ic-lang-b')].find(x => x.textContent.trim().toLowerCase() === l); b.click(); }, L); await W(700);
    res.lang[L] = await page.evaluate(() => ({ h1: document.querySelector('h1').textContent, sub: (document.querySelector('.ic-h-ru') || {}).textContent || '', lang: document.documentElement.lang, hash: location.hash }));
    ok('lang ' + L + ' hash kept', res.lang[L].hash === '#/iconologie/p1-5', res.lang[L]);
  }
  ok('en title differs from ru', res.lang.en.sub !== res.lang.ru.sub, res.lang);
  // язык на списке не сбрасывает прокрутку
  await open(LIST, 'ru'); await page.waitForSelector('.ic-row-item');
  await W(1800); await page.evaluate(() => window.scrollTo(0, 2500)); await W(500);
  const ys = await page.evaluate(() => scrollY);
  await page.evaluate(() => { const b = document.querySelector('.ic-lang-b[data-lang="en"]') || [...document.querySelectorAll('.ic-lang-b')].find(x => /en/i.test(x.textContent)); b.click(); }); await W(900);
  res.listLangY = await page.evaluate(() => scrollY); res.listLangYbefore = ys;
  if (NEW) ok('list lang change keeps scroll', ys > 1000 && Math.abs(res.listLangY - ys) < 700, { ys, y: res.listLangY });
  res.enListN = await rows(); ok('en list 440', res.enListN === 440, res.enListN);
  // поиск работает на EN и FR
  for (const [L, q] of [['en', 'Abundance'], ['fr', 'Abondance']]) {
    await open(LIST, L); await page.waitForSelector('.ic-row-item');
    await A.search(q); res['search_' + L] = await rows(); ok('search ' + L + ' > 0', res['search_' + L] > 0);
  }

  if (NEW) {
    // кнопка «Часть» и шторка
    await open(LIST, 'ru'); await page.waitForSelector('.ic-row-item');
    await A.clear(); await page.evaluate(() => { document.querySelector('#ic-ripa-part [data-f="all"]').click(); }); await W(300);
    res.partBtn = await page.$eval('[data-rb="part"]', e => e.textContent.trim()); ok('part button label default', res.partBtn === 'Часть', res.partBtn);
    await page.click('[data-rb="part"]'); await W(600);
    res.partRows = await page.$$eval('#ic-ripa-part [data-f]', els => els.map(e => e.textContent.trim() + ':' + e.getAttribute('aria-pressed')));
    ok('part sheet 3 rows', res.partRows.length === 3 && /Все части:true/.test(res.partRows[0]), res.partRows);
    await page.evaluate(() => document.querySelector('#ic-ripa-part [data-f="2"]').click()); await W(500);
    res.partBtn2 = await page.$eval('[data-rb="part"]', e => e.textContent.trim()); ok('part button -> Часть 2', /Часть 2/.test(res.partBtn2), res.partBtn2);
    ok('part 2 count', (await rows()) === 266);
    // обложка, меню, шторки без заголовка, подписи кнопок
    await open('#/iconologie', 'ru'); await page.waitForSelector('.ic-home-hero');
    const cv = await page.evaluate(() => ({
      kicker: document.querySelector('.ic-kicker').textContent, h1: document.querySelector('h1').textContent, author: document.querySelector('.ic-home-author').textContent,
      ed: document.querySelector('.ic-home-ed').textContent, tiles: [...document.querySelectorAll('.ic-home-tile b')].map(e => e.textContent), blurb: document.querySelector('.ic-home-blurb').textContent.length,
      fig: !!document.querySelector('.ic-home-fig img'), figH: document.querySelector('.ic-home-fig img').getBoundingClientRect().height, rows: document.querySelectorAll('.ic-row-item').length,
      tabs: [...document.querySelectorAll('.ic-bt-tabs a')].map(a => a.textContent.trim() + (a.classList.contains('on') ? '*' : '')), orn: document.querySelectorAll('.ic-orn-headpiece,.ic-orn-tailpiece').length }));
    res.cover = cv;
    ok('cover texts', cv.kicker === 'Iconologie' && cv.h1 === 'Иконология' && cv.author === 'Чезаре Рипа' && cv.ed === 'Париж, 1677 · перевод Жана Бодуэна', cv);
    ok('cover tiles/figure', cv.tiles.join() === 'Статьи,Гравюры' && cv.fig && cv.blurb > 100 && cv.rows === 0 && cv.orn === 0, cv);
    ok('cover tabs none active', cv.tabs.join() === 'Статьи,Гравюры', cv.tabs);
    ok('cover fig height like cartari (<=40vh)', cv.figH > 80 && cv.figH <= 844 * 0.4 + 2, cv.figH);
    await page.click('.ic-home-tile >> nth=0'); await W(700);
    ok('tile -> list', (await page.evaluate(() => location.hash)) === '#/iconologie/list');
    await page.click('.ic-bt-back'); await W(700);
    ok('back from list -> cover', (await page.evaluate(() => location.hash)) === '#/iconologie');
    await page.click('.ic-bt-back'); await W(700);
    ok('back from cover -> library', (await page.evaluate(() => location.hash)) === '' || (await page.evaluate(() => location.hash)) === '#/');
    await open('#/iconologie/list', 'ru'); await page.waitForSelector('.ic-row-item');
    const sh = await page.evaluate(() => ['#ic-ripa-part', '#ic-ripa-sort'].map(id => { const e = document.querySelector(id); const r = e.querySelector('.ic-tv-typerow'), cs = getComputedStyle(r);
      return { head: !!e.querySelector('.ic-rb-sheet-head'), tt: cs.textTransform, bl: cs.borderLeftWidth, rad: cs.borderRadius, fs: cs.fontSize, minH: r.getBoundingClientRect().height }; }));
    res.sheets = sh; ok('sheets: no head, no caps, no border', sh.every(x => !x.head && x.tt === 'none' && x.bl === '0px' && x.rad === '8px'), sh);
    await page.click('[data-rb="sort"]'); await W(600);
    ok('sort rows >=44px', await page.evaluate(() => [...document.querySelectorAll('#ic-ripa-sort .ic-tv-typerow')].every(r => r.getBoundingClientRect().height >= 43.5)));
    res.ordDefault = await page.$eval('[data-rb="sort"]', e => e.textContent.trim()); ok('order label default', res.ordDefault === 'Порядок', res.ordDefault);
    await page.evaluate(() => document.querySelector('#ic-ripa-sort [data-sort-opt="ru"]').click()); await W(500);
    res.ordAlpha = await page.$eval('[data-rb="sort"]', e => e.textContent.trim()); ok('order label А–Я', res.ordAlpha === 'А–Я', res.ordAlpha);
    ok('sort sheet closes on tap', await page.evaluate(() => !document.querySelector('#ic-ripa-sort.ic-rb-sheet-open')));
    await page.evaluate(() => document.querySelector('#ic-ripa-sort [data-sort-opt="book"]').click()); await W(300);
    // результаты лупы: крупнее, подсветка мягким фоном
    await page.click('.ic-bt-search'); await W(500); await A.loupe('зеркал');
    const lp = await page.evaluate(() => { const a = document.querySelector('#ic-rb-sheet .ic-rp-sra'), t = a.querySelector('.ic-sr-t'), sn = a.querySelector('.ic-sr-snip'), m = a.querySelector('mark');
      return { t: getComputedStyle(t).fontSize, s: getComputedStyle(sn).fontSize, lh: getComputedStyle(sn).lineHeight, mb: m && getComputedStyle(m).boxShadow, mr: m && getComputedStyle(m).borderRadius, mbg: m && getComputedStyle(m).backgroundColor }; });
    res.loupeStyle = lp; ok('loupe result sizes', lp.t === '17px' && lp.s === '15px' && lp.lh === '21px', lp);
    ok('loupe mark soft', lp.mb === 'none' && parseFloat(lp.mr) >= 3 && /rgba\(214, 150, 96/.test(lp.mbg), lp);
    await page.keyboard.press('Escape'); await W(300);
    // гравюра в статье: высота ≤ 55% видимой, просмотр на весь экран, «назад» закрывает
    await open('#/iconologie/p1-5', 'ru'); await page.waitForSelector('.ic-fig img'); await W(1200);
    const g = await page.evaluate(() => { const im = document.querySelector('.ic-fig img'), r = im.getBoundingClientRect(), st = document.getElementById('ic-stack').getBoundingClientRect().height; return { h: r.height, cap: (innerHeight - st) * 0.55, cx: Math.abs((r.left + r.width / 2) - innerWidth / 2) }; });
    res.fig = g; ok('figure height <= 55%', g.h <= g.cap + 1, g); ok('figure centered', g.cx < 3, g);
    await page.evaluate(() => scrollTo(0, 120)); await W(300); const y1 = await page.evaluate(() => scrollY);
    await page.evaluate(() => document.querySelector('.ic-fig').click()); await W(700);
    ok('viewer open', await page.evaluate(() => !!document.querySelector('.ic-svx-one img')));
    await page.goBack(); await W(700);
    ok('viewer closed by back', await page.evaluate(() => !document.querySelector('.ic-svx-one') && location.hash === '#/iconologie/p1-5'));
    ok('article position kept after viewer', Math.abs((await page.evaluate(() => scrollY)) - y1) < 4, y1);
    await page.evaluate(() => document.querySelector('.ic-fig').click()); await W(500); await page.click('.ic-svx-back'); await W(600);
    ok('viewer closed by corner', await page.evaluate(() => !document.querySelector('.ic-svx-one')));
    // подписи соседних статей
    res.pagerLbl = await page.$$eval('.ic-rp-nb small', els => els.map(e => e.textContent)); ok('pager labels', res.pagerLbl.join() === 'Предыдущая,Следующая', res.pagerLbl);
    // нет кириллицы в EN/FR на обложке, списке и в шторках
    for (const L of ['en', 'fr']) {
      await open('#/iconologie', L); await page.waitForSelector('.ic-home-hero');
      const badc = await page.evaluate(() => { const out = []; const w = document.createTreeWalker(document.getElementById('iconologie'), NodeFilter.SHOW_TEXT); let n; while ((n = w.nextNode())) if (/[\u0400-\u04FF]/.test(n.data)) out.push(n.data.trim().slice(0, 40)); return out.slice(0, 5); });
      ok('no cyrillic cover ' + L, badc.length === 0, badc);
      await open(LIST, L); await page.waitForSelector('.ic-row-item');
      const bad = await page.evaluate(() => { const out = []; const w = document.createTreeWalker(document.getElementById('iconologie'), NodeFilter.SHOW_TEXT); let n; while ((n = w.nextNode())) if (/[\u0400-\u04FF]/.test(n.data)) out.push(n.data.trim().slice(0, 40)); return out.slice(0, 5); });
      ok('no cyrillic ' + L, bad.length === 0, bad);
    }
  }
  if (NEW) {
    // посимвольный ввод в «Найти» при прокрученном списке и открытой шторке: шапка и меню на месте, ошибок нет
    const inView = () => page.evaluate(() => { const st = document.getElementById('ic-stack'); if (!st) return 'no stack'; const r = st.getBoundingClientRect(); return (r.top >= -1 && r.top < 5 && r.height > 50 && !!document.querySelector('.ic-booktabs') && !!document.querySelector('.ic-rbar')) ? 'ok' : 'stack off-screen top=' + Math.round(r.top); });
    const typed = { ru: ['изобилие', 'ёж', 'дух-', '(любовь)', '«мир»', 'слава  мира', 'а', 'й'], en: ['Abundance', 'a', '-', "it's", '"a"'], fr: ['Éloquence', 'à la', 'œ', "l'a", 'ç', 'Amour (dompté)'] };
    res.typing = {};
    for (const L of ['ru', 'en', 'fr']) for (const [part, sort] of [['all', 'book'], ['1', 'ru'], ['2', 'page']]) {
      await open(LIST, L); await page.waitForSelector('.ic-row-item'); await W(1800);
      await page.evaluate(([pt, so]) => { document.querySelector('#ic-ripa-part [data-f="' + pt + '"]').click(); document.querySelector('#ic-ripa-sort [data-sort-opt="' + so + '"]').click(); }, [part, sort]); await W(300);
      await page.evaluate(() => scrollTo(0, 4000)); await W(300); await page.evaluate(() => scrollTo(0, 4300)); await W(700);
      await page.click('[data-rb="find"]'); await W(700);
      const inp = page.locator('.ic-rbar-findin'); let bad = [];
      for (const str of typed[L]) {
        await inp.fill('');
        for (const ch of str) { await inp.pressSequentially(ch, { delay: 4 }); const v = await inView(); if (v !== 'ok') bad.push(str + '@' + ch + ': ' + v); }
        await W(80); const v2 = await inView(); if (v2 !== 'ok') bad.push(str + ' end: ' + v2);
      }
      await inp.fill(''); await inp.press('Backspace'); await W(100);
      ok('typing ' + L + ' ' + part + '/' + sort, bad.length === 0, bad.slice(0, 3));
      res.typing[L + part + sort] = bad.length;
    }
    // защита: исключение в построении списка — каркас остаётся, шторка и подложка закрываются, ошибка в консоли
    const pg = await ctx.newPage(); const gerrs = [];
    pg.on('console', m => { if (m.type() === 'error' && !benign(m.text())) gerrs.push(m.text()); });
    pg.on('pageerror', e => { if (!benign(e.message)) gerrs.push('pageerror: ' + e.message); });
    await pg.goto(URL0 + '#/iconologie/list', { waitUntil: 'load' }); await pg.waitForSelector('.ic-row-item'); await W(1200);
    await pg.click('[data-rb="find"]'); await W(600);
    await pg.evaluate(() => { const o = String.prototype.normalize; String.prototype.normalize = function () { throw new Error('boom'); }; setTimeout(() => { String.prototype.normalize = o; }, 1500); });
    await pg.locator('.ic-rbar-findin').pressSequentially('аб', { delay: 10 }); await W(300);
    const g = await pg.evaluate(() => ({ st: !!document.getElementById('ic-stack'), tabs: !!document.querySelector('.ic-booktabs'), bar: !!document.querySelector('.ic-rbar'), sheetOpen: !!document.querySelector('.ic-rb-sheet-open'), dim: getComputedStyle(document.getElementById('ic-rb-dim')).opacity, locked: document.body.style.position === 'fixed' }));
    res.guard = g; ok('guard: frame stays, sheet closed', g.st && g.tabs && g.bar && !g.sheetOpen && g.dim === '0' && !g.locked, g);
    ok('guard: error logged', gerrs.some(e => /ripa list render failed/.test(e)), gerrs);
    await pg.close();
  }
  if (NEW) {
    // название статьи и вкладка «Статьи» → список на этой статье с подсветкой; «назад» браузера → в статью
    const target = '#/iconologie/p2-123';
    const onList = async (tag) => {
      await W(1500);
      const r = await page.evaluate(() => { const row = document.querySelector('.ic-row-item[data-id="p2-123"]'); if (!row) return { row: false, hash: location.hash }; const b = row.getBoundingClientRect(), st = document.getElementById('ic-stack').getBoundingClientRect();
        return { row: true, hash: location.hash, top: b.top, stackBottom: st.bottom, h: innerHeight, hl: !!row.querySelector('.ic-hl-mark') }; });
      ok(tag + ': list hash', r.hash === '#/iconologie/list', r);
      ok(tag + ': row visible under header', r.row && r.top >= r.stackBottom - 2 && r.top < r.h - 40, r);
      ok(tag + ': row highlighted', r.hl, r);
      await W(6500);
      ok(tag + ': highlight fades', await page.evaluate(() => !document.querySelector('.ic-row-item .ic-hl-mark')), tag);
    };
    for (const via of ['title', 'tab']) {
      await open(LIST, 'ru'); await page.waitForSelector('.ic-row-item');
      await page.evaluate(t => { location.hash = t; }, target); await page.waitForSelector('.ic-rbar-lbl-b'); await W(900);
      if (via === 'title') {
        const bt = await page.$eval('.ic-rbar-lbl-b', e => { const r = e.getBoundingClientRect(); return { h: parseFloat(getComputedStyle(e, '::after').height), tt: getComputedStyle(e).textTransform, cur: getComputedStyle(e).cursor }; });
        ok('title button touch zone >=44px', bt.h >= 43.5, bt); ok('title pointer', bt.cur === 'pointer', bt);
        await page.click('.ic-rbar-lbl-b');
      } else await page.click('.ic-bt-tabs a[href$="/list"]');
      await onList(via);
      await page.goBack(); await W(900);
      ok(via + ': browser back -> article', (await page.evaluate(() => location.hash)) === target);
    }
    // фильтры: сбрасывается только мешающее
    await open(LIST, 'ru'); await page.waitForSelector('.ic-row-item'); await W(1500);
    await page.evaluate(() => document.querySelector('#ic-ripa-part [data-f="1"]').click()); await W(300);
    await page.evaluate(t => { location.hash = t; }, target); await page.waitForSelector('.ic-rbar-lbl-b'); await W(900);
    await page.click('.ic-rbar-lbl-b'); await W(1500);
    const f1 = await page.evaluate(() => ({ part: document.querySelector('[data-rb="part"]').textContent.trim(), hl: !!document.querySelector('.ic-row-item[data-id="p2-123"] .ic-hl-mark') }));
    ok('hidden by part: part reset, article shown', f1.part === 'Часть' && f1.hl, f1);
    await page.evaluate(() => document.querySelector('#ic-ripa-part [data-f="2"]').click()); await W(300);
    await A.search('Abondance'); await W(300);
    await page.evaluate(t => { location.hash = t; }, target); await page.waitForSelector('.ic-rbar-lbl-b'); await W(900);
    await page.click('.ic-rbar-lbl-b'); await W(1500);
    const f2 = await page.evaluate(() => ({ part: document.querySelector('[data-rb="part"]').textContent.trim(), q: document.querySelector('.ic-rbar-findin').value, hl: !!document.querySelector('.ic-row-item[data-id="p2-123"] .ic-hl-mark') }));
    ok('hidden by text: text reset, part kept', f2.part === 'Часть 2' && f2.q === '' && f2.hl, f2);
    await page.evaluate(() => document.querySelector('#ic-ripa-part [data-f="all"]').click());
  }
  if (NEW) {
    // ---- четвёртый заход: лёгкий верх ----
    await open('#/cartari/index', 'ru'); await W(2200);
    const cm = await page.evaluate(() => { const row = document.querySelector('.ic-rbar-row'), b = row.querySelector('button'), cs = getComputedStyle(b), rs = getComputedStyle(row);
      return { rowH: Math.round(row.getBoundingClientRect().height), btnH: Math.round(b.getBoundingClientRect().height), fs: cs.fontSize, ls: cs.letterSpacing, tt: cs.textTransform, ff: cs.fontFamily, fw: cs.fontWeight, bd: rs.border, rad: rs.borderRadius }; });
    await open(LIST, 'ru'); await page.waitForSelector('.ic-row-item'); await W(1500);
    const rm = await page.evaluate(() => { const row = document.querySelector('.ic-rbar-row'), b = row.querySelector('button'), cs = getComputedStyle(b), rs = getComputedStyle(row);
      return { rowH: Math.round(row.getBoundingClientRect().height), btnH: Math.round(b.getBoundingClientRect().height), fs: cs.fontSize, ls: cs.letterSpacing, tt: cs.textTransform, ff: cs.fontFamily, fw: cs.fontWeight, bd: rs.border, rad: rs.borderRadius,
        touch: [...row.querySelectorAll(':scope > button')].map(x => parseFloat(getComputedStyle(x, '::after').height)) }; });
    res.rbarMeasure = { cart: cm, ripa: rm };
    ok('rbar like cartari index', ['rowH', 'btnH', 'fs', 'ls', 'tt', 'ff', 'fw', 'bd', 'rad'].every(k => cm[k] === rm[k]), res.rbarMeasure);
    ok('rbar touch zone >=44', rm.touch.length === 3 && rm.touch.every(h => h >= 44), rm.touch);
    const tb = await page.evaluate(() => { const a = [...document.querySelectorAll('.ic-bt-tabs a')], on = document.querySelector('.ic-bt-tabs a.on'), lab = on.querySelector('.ic-bt-label'), tr = document.querySelector('.ic-bt-tabs').getBoundingClientRect();
      const r = a.map(x => x.getBoundingClientRect()), gapL = r[0].left - tr.left, gapM = r[1].left - r[0].right, gapR = tr.right - r[1].right;
      return { w: Math.round(on.getBoundingClientRect().width), lab: Math.round(lab.getBoundingClientRect().width), gapL: Math.round(gapL), gapM: Math.round(gapM), gapR: Math.round(gapR) }; });
    res.tabs = tb; ok('active tab as wide as word + padding', tb.w - tb.lab >= 20 && tb.w - tb.lab <= 44, tb); ok('tabs spread evenly', Math.abs(tb.gapL - tb.gapR) <= 2 && Math.abs(tb.gapM - tb.gapL) <= 6, tb);
    // шапка списка
    const hd = await page.evaluate(() => ({ kicker: !!document.querySelector('.ic-rp .ic-kicker'), h1: parseFloat(getComputedStyle(document.querySelector('h1')).fontSize), count: document.querySelector('.ic-rp-count').textContent, match: /Совпадения/.test(document.querySelector('.ic-rp').textContent) }));
    ok('list head: no kicker, small title, no count', !hd.kicker && hd.h1 <= 2.1 * 18 + 1 && hd.count === '', hd);
    // «Найти» в строке раздела — см. rowSearch ниже
    // тёмные шторки: без кремовой рамки вокруг поля
    await page.click('.ic-bt-search'); await W(600);
    const lp = await page.evaluate(() => { const f = document.querySelector('#ic-rb-sheet .ic-home-search'), i = f.querySelector('input'); return { bg: getComputedStyle(f).backgroundColor, bd: getComputedStyle(f).borderTopWidth, ibd: getComputedStyle(i).borderTopColor, rad: getComputedStyle(i).borderTopLeftRadius, ibg: getComputedStyle(i).backgroundColor }; });
    ok('loupe field: no cream frame, 8px dark field', lp.bg === 'rgba(0, 0, 0, 0)' && lp.bd === '0px' && lp.rad === '8px' && /0\.28/.test(lp.ibd), lp);
    await page.keyboard.press('Escape'); await W(300);
    await page.keyboard.press('Escape'); await W(300);

    // ---- пятый заход ----
    // 1. шторка «Порядок»: заканчивается сразу после последнего варианта
    await open(LIST, 'ru'); await page.evaluate(() => sessionStorage.clear()); await page.reload({ waitUntil: 'load' }); await page.waitForSelector('.ic-row-item'); await W(1200);
    await page.click('[data-rb="sort"]'); await W(700);
    const sg = await page.evaluate(() => { const rows = document.querySelectorAll('#ic-ripa-sort .ic-tv-typerow'), last = rows[rows.length - 1].getBoundingClientRect(), pn = document.querySelector('#ic-ripa-sort .ic-rb-sheet-panel').getBoundingClientRect(); return Math.round(pn.bottom - last.bottom); });
    ok('order sheet: no empty space under last option (<=34px)', sg >= 0 && sg <= 34, sg);
    await page.keyboard.press('Escape'); await W(300);
    await open(LIST, 'ru'); await page.waitForSelector('.ic-row-item'); await W(1200);
    // 2. строка раздела: без рамки, разделители, мельче и тусклее вкладок, выделена только активная кнопка
    const rs5 = await page.evaluate(() => { const row = document.querySelector('.ic-rbar-row'), b = row.querySelectorAll(':scope > button'), tab = document.querySelector('.ic-bt-tabs a .ic-bt-label') || document.querySelector('.ic-bt-tabs a'), sep = getComputedStyle(b[1], '::before');
      return { bd: getComputedStyle(row).borderTopWidth, fs: parseFloat(getComputedStyle(b[0]).fontSize), tabFs: parseFloat(getComputedStyle(tab).fontSize), sepBg: sep.backgroundColor, sepH: sep.height,
        on: [...b].map(x => x.classList.contains('ic-rbar-on') || x.getAttribute('aria-pressed') === 'true'), btnBd: [...b].map(x => getComputedStyle(x).borderLeftWidth + '/' + getComputedStyle(x).borderTopWidth) }; });
    ok('section row: v180 look (frame, cells), buttons 10.5px, smaller than tabs, nothing highlighted by default', rs5.bd === '1px' && rs5.fs === 10.5 && rs5.fs < rs5.tabFs && rs5.on.every(x => !x), rs5);
    // 3. «Найти» прямо в строке раздела: открытие, ввод, «Готово», повторное открытие с текстом, крестик в обоих режимах, ширины ячеек, без transition
    const rowSearch = async (name, idle, ph, word, listSel) => {
      const st = () => page.evaluate(() => { const r = document.querySelector('.ic-rbar-row'), f = document.querySelector('.ic-rbar-findrow'), b = document.querySelector('.ic-rbar-tvsearch'), l = b.querySelector('.ic-rbar-tvsearch-label'), i = f.querySelector('input');
        return { rowHidden: r.hidden, rowH: Math.round(r.getBoundingClientRect().height), findHidden: f.hidden, findH: Math.round(f.getBoundingClientRect().height), widths: [...r.querySelectorAll(':scope > button')].map(x => Math.round(x.getBoundingClientRect().width)),
          lbl: b.textContent.trim(), fit: l.scrollWidth <= l.clientWidth + 1, val: i.value, ph: i.placeholder, focus: document.activeElement === i, sheets: document.querySelectorAll('.ic-rb-sheet-open').length, pageH: document.documentElement.scrollHeight,
          tr: [...document.querySelectorAll('.ic-rbar-row button, .ic-bt-tabs a, .ic-lang-b, .ic-bt-back, .ic-bt-search, .ic-rbar-findrow button')].map(x => getComputedStyle(x).transitionDuration + '|' + getComputedStyle(x).animationName) }; });
      const s0 = await st();
      ok(name + ': idle label', s0.lbl === idle, s0.lbl);
      ok(name + ': no transition/animation on buttons', s0.tr.every(x => x === '0s|none'), s0.tr.filter(x => x !== '0s|none'));
      const bb = await page.$eval('.ic-rbar-row > button:last-child', b => { const r = b.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
      await page.mouse.move(bb[0], bb[1]); await page.mouse.down(); await W(80);
      const pr = await page.$eval('.ic-rbar-row > button:last-child', b => { const c = getComputedStyle(b); return { bg: c.backgroundColor, sh: c.boxShadow, tf: c.transform, rad: c.borderRadius, tr: c.transitionDuration }; });
      await page.mouse.move(200, 420); await page.mouse.up(); await W(100);
      ok(name + ': pressed button instantly gets "variant 3", no scale/transition', pr.bg === 'rgba(236, 229, 212, 0.14)' && /0\.28/.test(pr.sh) && pr.tf === 'none' && pr.rad === '8px' && pr.tr === '0s', pr);
      await page.click('.ic-rbar-tvsearch'); await W(400);
      const s1 = await st();
      ok(name + ': row becomes input (same height), keyboard focus, no sheet', s1.rowHidden && !s1.findHidden && s1.findH === s0.rowH && s1.focus && s1.ph === ph && s1.sheets === 0 && s1.pageH === s0.pageH, { s0h: s0.rowH, s1 });
      await page.locator('.ic-rbar-findin').pressSequentially(word, { delay: 30 }); await W(500);
      const s2 = await st();
      ok(name + ': list filters while typing', await page.evaluate(sel => document.querySelectorAll(sel).length, listSel) > 0 && s2.val === word);
      await page.keyboard.press('Enter'); await W(400);
      const s3 = await st();
      ok(name + ': Enter returns the row, filter kept, label "' + word + ' · N" without prefix, widths unchanged, keyboard hidden',
        !s3.rowHidden && s3.findHidden && !s3.focus && !/:/.test(s3.lbl) && /^[^ ]+… · \d+$|^[^ ]+ · \d+$|^\d+$/.test(s3.lbl) && s3.fit && JSON.stringify(s3.widths) === JSON.stringify(s0.widths) && s3.rowH === s0.rowH, { s0w: s0.widths, s3 });
      await page.click('.ic-rbar-tvsearch'); await W(400);
      const s4 = await st(); ok(name + ': reopen shows typed text', !s4.findHidden && s4.val === word && s4.focus, s4);
      await page.click('.ic-rbar-done'); await W(300);
      const s5 = await st(); ok(name + ': "Done" returns the row, filter kept', !s5.rowHidden && s5.findHidden && s5.lbl === s3.lbl && !s5.focus, s5);
      await page.click('.ic-rbar-tvsearch'); await W(300);
      await page.click('.ic-rbar-findx'); await W(400);
      const s6 = await st(); ok(name + ': cross with text clears, field stays open', !s6.findHidden && s6.val === '' && s6.focus, s6);
      await page.click('.ic-rbar-findx'); await W(400);
      const s7 = await st(); ok(name + ': cross on empty field closes it, row shows "' + idle + '"', !s7.rowHidden && s7.findHidden && s7.lbl === idle && JSON.stringify(s7.widths) === JSON.stringify(s0.widths), s7);
      await page.click('.ic-rbar-tvsearch'); await W(300);
      await page.evaluate(sel => document.querySelector(sel).dispatchEvent(new Event('touchmove', { bubbles: true })), listSel.split(',')[0].replace(/^\.ic-tv-e$/, '.ic-tv-list')); await W(400);
      const s8 = await st(); ok(name + ': scroll closes the field', !s8.rowHidden && s8.findHidden, s8);
      await page.click('.ic-rbar-tvsearch'); await W(300);
      await page.evaluate(() => document.querySelector('.ic-rbar-findin').dispatchEvent(new Event('keydown', { bubbles: true })));
      await page.keyboard.press('Escape'); await W(200);
      res['rowSearch_' + name] = { s0, s3 };
    };
    await open(LIST, 'ru'); await page.evaluate(() => sessionStorage.clear()); await page.reload({ waitUntil: 'load' }); await page.waitForSelector('.ic-row-item'); await W(1200);
    await rowSearch('ripa list', 'Найти статью', 'Название или предмет', 'лав', '.ic-rp-list');
    for (const [pg, idle, ph, listSel] of [['names', 'Найти имя', 'Имя', '.ic-tv-list'], ['index', 'Найти в указателе', 'Слово в указателе', '.ic-tv-list']]) {
      await open('#/cartari/' + pg, 'ru'); await page.evaluate(() => sessionStorage.clear()); await page.reload({ waitUntil: 'load' }); await W(2200);
      await rowSearch('cartari ' + pg, idle, ph, 'аполлон', listSel);
    }
    // EN/FR: подписи и подсказки
    for (const [lang, idle, ph] of [['en', 'Find name', 'Name'], ['fr', 'Chercher un nom', 'Nom']]) {
      await open('#/cartari/names', lang); await W(2200);
      const l = await page.evaluate(() => ({ lbl: document.querySelector('.ic-rbar-tvsearch').textContent.trim(), ph: document.querySelector('.ic-rbar-findin').placeholder, done: document.querySelector('.ic-rbar-done').textContent.trim() }));
      ok('cartari names ' + lang + ': labels', l.lbl === idle && l.ph === ph && l.done.length > 1, l);
    }
    // 3c. лупа Картари: одинаковые результаты с любой вкладки, подсказка «Поиск по всей книге»
    const loupeN = {};
    for (const pg of ['names', 'index', 'text']) {
      await open('#/cartari/' + pg, 'ru'); await W(2000);
      await page.click('.ic-bt-search'); await W(500);
      const ph = await page.$eval('#ic-rb-sheet input.ic-search', e => e.placeholder);
      await page.locator('#ic-rb-sheet input.ic-search').pressSequentially('аполлон', { delay: 30 }); await W(2500);
      loupeN[pg] = await page.evaluate(() => ({ ph: '', txt: document.querySelector('#ic-rb-sheet .ic-sr').innerText.slice(0, 40), n: document.querySelectorAll('#ic-rb-sheet .ic-sr li, #ic-rb-sheet .ic-sr-nm > *, #ic-rb-sheet .ic-sr-tv > *').length })); loupeN[pg].ph = ph;
    }
    await page.evaluate(() => sessionStorage.clear());
    ok('cartari loupe: same results from any tab, no "not added" message, placeholder', Object.values(loupeN).every(v => !/ещё не добавлен/.test(v.txt) && v.n > 0 && v.ph === 'Поиск по всей книге') && new Set(Object.values(loupeN).map(v => v.n)).size === 1, loupeN);
  }
  if (NEW) {
    // ---- переход из лупы: первая отрисованная позиция уже у слова, без кадра с y=0 и без прыжка ----
    await open('#/iconologie/list', 'ru'); await page.evaluate(() => sessionStorage.clear()); await page.reload({ waitUntil: 'load' }); await page.waitForSelector('.ic-row-item'); await W(1200);
    for (const w of ['горе', 'любовь']) {
      await page.evaluate(() => { window.__fr = []; (function t() { const m = document.querySelector('.ic-rp .ic-ch-mark'), wrap = document.querySelector('.ic-rp .ic-text, .ic-rp .ic-attrs, .ic-rp .ic-figs'), rp = document.querySelector('.ic-rp');
        window.__fr.push({ h: location.hash, y: Math.round(scrollY), mark: m ? Math.round(m.getBoundingClientRect().top) : null, vis: !!rp && getComputedStyle(rp).visibility !== 'hidden' && !!wrap }); requestAnimationFrame(t); })(); });
      await page.click('.ic-bt-search'); await W(500);
      await page.locator('#ic-rb-sheet input.ic-search').fill(''); await page.locator('#ic-rb-sheet input.ic-search').pressSequentially(w, { delay: 30 }); await W(900);
      if (!(await page.$('#ic-rb-sheet .ic-sr-a'))) console.log('DBG', w, await page.evaluate(() => location.hash + ' | ' + document.querySelector('#ic-rb-sheet').className + ' | ' + document.querySelector('#ic-rb-sheet .ic-sr').innerHTML.slice(0, 120)));
      await page.click('#ic-rb-sheet .ic-sr-a'); await W(2500);
      const fr = await page.evaluate(() => window.__fr);
      const onArt = fr.filter(f => /#\/iconologie\/p\d/.test(f.h) && f.vis);
      const first = onArt[0], ys = onArt.map(f => f.y);
      const sh = await page.evaluate(() => { const m = document.querySelector('.ic-rp .ic-ch-mark'); return m ? Math.round(m.getBoundingClientRect().top) : -1; });
      res['jump_' + w] = { frames: onArt.length, first, finalMarkTop: sh, minY: Math.min(...ys), maxY: Math.max(...ys) };
      ok('loupe→article "' + w + '": first visible frame already at the word, no y=0 frame, no jump',
        onArt.length > 0 && first.mark !== null && first.mark > 60 && first.mark < 420 && !onArt.some(f => f.y < 5) && Math.max(...ys) - Math.min(...ys) < 6, res['jump_' + w]);
      console.log('JUMP', w, JSON.stringify(res['jump_' + w]));
      await page.evaluate(() => { location.hash = '#/iconologie/list'; }); await W(1500);
    }
  }
  if (NEW) { // ?new из закладок не ломает адрес: тот же основной вид
    await page.goto(BASE + '?new#/iconologie', { waitUntil: 'load' }); await W(900);
    ok('legacy ?new works', await page.evaluate(() => !!document.querySelector('.ic-home-hero') && !!document.querySelector('.ic-bt-tabs')));
    await page.goto(BASE + '?new#/iconologie/list', { waitUntil: 'load' }); await W(900);
    ok('legacy ?new list', (await rows()) > 100);
  }
  ok('console clean', errs.length === 0, errs.slice(0, 5));
  await br.close();

  // сравнение с базой
  if (!NEW) { fs.writeFileSync(BASEFILE, JSON.stringify(res, null, 1)); }
  else if (fs.existsSync(BASEFILE)) {
    const b = JSON.parse(fs.readFileSync(BASEFILE, 'utf8'));
    const cmp = (name, a, c) => { if (JSON.stringify(a) !== JSON.stringify(c)) fails.push('baseline ' + name + ': ' + JSON.stringify(a) + ' vs ' + JSON.stringify(c)); };
    cmp('total', b.total, res.total);
    if (!NEW) for (const k of Object.keys(b.search)) cmp('search.' + k + '.n', b.search[k].n, res.search[k].n);
    cmp('part', b.part, res.part); cmp('p1_5', b.p1_5, res.p1_5); cmp('direct.h1', b.direct.h1, res.direct.h1);
    cmp('searchEmpty', b.searchEmpty, res.searchEmpty);
    if (!NEW) { cmp('search_en', b.search_en, res.search_en); cmp('search_fr', b.search_fr, res.search_fr); }
    cmp('sort.page', b.sort.page, res.sort.page);
  }
  fs.writeFileSync(path.join(OUT, NEW ? 'ripa-new-result.json' : 'ripa-old-result.json'), JSON.stringify({ res, fails, errs }, null, 1));
  console.log(JSON.stringify(res));
  console.log(fails.length ? 'FAIL:\n' + fails.join('\n') : 'OK');
  process.exit(fails.length ? 1 : 0);
})();
