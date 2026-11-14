/* Автотест «Иконологии» Рипы (Playwright WebKit, iPhone 13).
 * Проверяет поведение: поиск (сюжет, предмет, слово), фильтр по частям, сортировку, счётчик «Найдено»,
 * переход в статью и «назад» (с позицией), пред./след., прямую ссылку #/iconologie/p1-N, скан/текст, RU/EN/FR.
 *
 * Запуск (из корня репозитория, сайт отдаётся на BASE):
 *   python3 -m http.server 8950 &
 *   cd tools/playwright-check && BASE=http://localhost:8950/index.html node check_ripa.js          # старый вид
 *   cd tools/playwright-check && NEW=1 BASE=... node check_ripa.js                                   # новый вид (?new)
 * Старый вид пишет out/ripa-baseline.json; новый сравнивает свои числа с ним.
 * Код выхода: 0 — всё прошло, 1 — есть расхождения.
 */
const { webkit, devices } = require('playwright');
const fs = require('fs'), path = require('path');
const NEW = !!process.env.NEW;
const BASE = process.env.BASE || 'http://localhost:8950/index.html';
const URL0 = BASE + (NEW ? '?new' : '');
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const BASEFILE = path.join(OUT, 'ripa-baseline.json');
const res = {}, fails = [], errs = [];
const ok = (name, cond, info) => { if (!cond) fails.push(name + (info !== undefined ? ' :: ' + JSON.stringify(info) : '')); };
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
        await page.evaluate(q => { const i = document.querySelector('#ic-ripa-find input.ic-search'); i.value = q; i.dispatchEvent(new Event('input', { bubbles: true })); }, q);
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
  await open('#/iconologie', 'ru');
  await page.waitForSelector('.ic-row-item');
  res.total = await rows(); ok('list rows 440', res.total === 440, res.total);
  res.countText = await page.$eval('.ic-count', e => e.textContent); ok('count visible', /440/.test(res.countText), res.countText);

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
  for (const v of ['1', '2', 'all']) { await A.part(v); res.part[v] = { n: await rows(), c: await countNum() }; ok('part ' + v + ' n==c', res.part[v].n === res.part[v].c, res.part[v]); }
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
  res.backHash = await page.evaluate(() => location.hash); ok('back ctl -> list', /^#\/iconologie\/?$/.test(res.backHash), res.backHash);
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
  await open('#/iconologie', 'ru'); await page.waitForSelector('.ic-row-item');
  await page.evaluate(() => window.scrollTo(0, 2500)); await W(400);
  const ys = await page.evaluate(() => scrollY);
  await page.evaluate(() => { const b = document.querySelector('.ic-lang-b[data-lang="en"]') || [...document.querySelectorAll('.ic-lang-b')].find(x => /en/i.test(x.textContent)); b.click(); }); await W(900);
  res.listLangY = await page.evaluate(() => scrollY); res.listLangYbefore = ys;
  if (NEW) ok('list lang change keeps scroll', Math.abs(res.listLangY - ys) < 700, { ys, y: res.listLangY });
  res.enListN = await rows(); ok('en list 440', res.enListN === 440, res.enListN);
  // поиск работает на EN и FR
  for (const [L, q] of [['en', 'Abundance'], ['fr', 'Abondance']]) {
    await open('#/iconologie', L); await page.waitForSelector('.ic-row-item');
    await A.search(q); res['search_' + L] = await rows(); ok('search ' + L + ' > 0', res['search_' + L] > 0);
  }

  if (NEW) {
    // кнопка «Часть» и шторка
    await open('#/iconologie', 'ru'); await page.waitForSelector('.ic-row-item');
    await A.clear(); await page.evaluate(() => { document.querySelector('#ic-ripa-part [data-f="all"]').click(); }); await W(300);
    res.partBtn = await page.$eval('[data-rb="part"]', e => e.textContent.trim()); ok('part button label', /Все части/.test(res.partBtn), res.partBtn);
    await page.click('[data-rb="part"]'); await W(600);
    res.partRows = await page.$$eval('#ic-ripa-part [data-f]', els => els.map(e => e.textContent.trim() + ':' + e.getAttribute('aria-pressed')));
    ok('part sheet 3 rows', res.partRows.length === 3 && /Все части:true/.test(res.partRows[0]), res.partRows);
    await page.evaluate(() => document.querySelector('#ic-ripa-part [data-f="2"]').click()); await W(500);
    res.partBtn2 = await page.$eval('[data-rb="part"]', e => e.textContent.trim()); ok('part button -> Часть 2', /Часть 2/.test(res.partBtn2), res.partBtn2);
    ok('part 2 count', (await rows()) === 266);
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
    // нет кириллицы в EN/FR на списке и в шторках
    for (const L of ['en', 'fr']) {
      await open('#/iconologie', L); await page.waitForSelector('.ic-row-item');
      const bad = await page.evaluate(() => { const out = []; const w = document.createTreeWalker(document.getElementById('iconologie'), NodeFilter.SHOW_TEXT); let n; while ((n = w.nextNode())) if (/[\u0400-\u04FF]/.test(n.data)) out.push(n.data.trim().slice(0, 40)); return out.slice(0, 5); });
      ok('no cyrillic ' + L, bad.length === 0, bad);
    }
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
