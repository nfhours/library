/* Поиск на странице «Мотивы»: ru/en/fr и синонимы независимо от языка интерфейса, вхождение, регистр/ё/диакритика,
 * порядок (начало названия → начало слова → внутри), подсказка по синониму, «Мотив не найден» + ссылки в поиск книг.
 * Запуск: python3 -m http.server 8977 & ; cd tools/playwright-check && BASE=http://localhost:8977/index.html node check_motifs_search.js */
const { webkit } = require('playwright'); const path = require('path');
const BASE = process.env.BASE || 'http://localhost:8977/index.html', OUT = path.join(__dirname, 'out'); const W = ms => new Promise(r => setTimeout(r, ms));
let bad = 0; const ok = (n, c, x) => { if (!c) bad++; console.log((c ? 'ok  ' : 'FAIL ') + n + (x ? ' ' + x : '')); };
const QS = ['апо', 'вен', 'медуз', 'зевс', 'юпитер', 'zeus', 'гермес', 'афродита', 'аполлон', 'apol', 'ap', 'змея', 'snake', 'serpent'];
(async () => {
  const br = await webkit.launch(); const errs = [];
  const ctx = await br.newContext({ viewport: { width: 390, height: 844 } }); const p = await ctx.newPage();
  p.on('pageerror', e => errs.push(e.message));
  const setLang = async l => { await p.evaluate(l => { localStorage.setItem('ic-lang', l); sessionStorage.clear(); }, l); try { await p.reload({ waitUntil: 'domcontentloaded', timeout: 20000 }); } catch (e) { await p.goto('about:blank'); await p.goto(BASE + '#/motifs', { waitUntil: 'domcontentloaded' }); } await p.waitForSelector('.ic-mot-findin', { timeout: 30000, state: 'attached' }); await W(600); };
  const ask = async q => {
    await p.evaluate(() => document.querySelector('.ic-mot-loupe').click()); await W(150);
    await p.evaluate(q => { const i = document.querySelector('.ic-mot-findin'); i.value = q; i.dispatchEvent(new Event('input', { bubbles: true })); }, q); await W(250);
    return p.evaluate(() => ({ tiles: [...document.querySelectorAll('.ic-mot-body .ic-mot-tile')].map(a => { const s = a.querySelector('.ic-mot-syn'); const nm = a.querySelector('.ic-mot-nm'); return { id: a.dataset.id, n: (nm.firstChild ? nm.firstChild.textContent : ''), syn: s ? s.textContent : '' }; }), nf: !!document.querySelector('.ic-mot-nf'), nfText: (document.querySelector('.ic-mot-nf') || {}).innerText || '' }));
  };
  await p.goto(BASE + '#/motifs'); await W(2500);
  const table = {};
  for (const L of ['ru', 'en', 'fr']) {
    await setLang(L);
    for (const q of QS) {
      const r = await ask(q); table[L + ' «' + q + '»'] = r.tiles.length ? r.tiles.length + ': ' + r.tiles.slice(0, 6).map(t => t.n).join(', ') : (r.nf ? '— (не найден)' : '— ?');
      if (L === 'ru' && q === 'зевс') await p.screenshot({ path: path.join(OUT, 'motsearch-ru-zeus.png') });
    }
    // очистка
    await p.evaluate(() => document.querySelector('.ic-mot-findx').click()); await W(200);
  }
  Object.keys(table).forEach(k => console.log(k.padEnd(14), table[k]));
  // независимость от языка интерфейса
  await setLang('ru'); let r = await ask('ap'); ok('RU «ap» (2 символа): только с начала слов, находит', r.tiles.length > 0, r.tiles.map(t => t.n).join(','));
  r = await ask('апо'); ok('RU «апо»: Аполлон есть, «Полусапожки» нет', r.tiles.some(t => t.n === 'Аполлон') && !r.tiles.some(t => /Полусапожки/.test(t.n)), r.tiles.map(t => t.n).join(','));
  r = await ask('зевс'); ok('RU «зевс» → Юпитер, подсказка «Зевс»', r.tiles.length === 1 && r.tiles[0].n === 'Юпитер' && r.tiles[0].syn === 'Зевс', JSON.stringify(r.tiles));
  r = await ask('zeus'); ok('RU «zeus» → Юпитер, подсказка «Zeus»', r.tiles.some(t => t.n === 'Юпитер' && t.syn === 'Zeus'), JSON.stringify(r.tiles));
  r = await ask('гермес'); ok('RU «гермес» → Меркурий', r.tiles.length >= 1 && r.tiles[0].n === 'Меркурий' && r.tiles[0].syn === 'Гермес', JSON.stringify(r.tiles));
  r = await ask('афродита'); ok('RU «афродита» → Венера', r.tiles.length === 1 && r.tiles[0].n === 'Венера', JSON.stringify(r.tiles));
  r = await ask('юпитер'); ok('RU «юпитер» → Юпитер без подсказки', r.tiles.length === 1 && r.tiles[0].n === 'Юпитер' && r.tiles[0].syn === '', JSON.stringify(r.tiles));
  r = await ask('вен'); { const i = r.tiles.findIndex(t => t.n === 'Венера'); ok('RU «вен»: Венера в выдаче (место ' + (i + 1) + ')', i >= 0, r.tiles.slice(0, 8).map(t => t.n).join(',')); }
  r = await ask('apol'); ok('RU «apol» → Аполлон (по en-названию)', r.tiles.some(t => t.n === 'Аполлон'), JSON.stringify(r.tiles));
  r = await ask('медуз'); ok('RU «медуз» находит', r.tiles.length > 0, r.tiles.map(t => t.n).join(','));
  await setLang('en'); r = await ask('медуз'); ok('EN «медуз» находит (по ru), название на языке интерфейса', r.tiles.length > 0 && r.tiles.every(t => !/[а-я]/i.test(t.n)), r.tiles.map(t => t.n).join(','));
  await setLang('ru'); r = await ask('ЗМЕЯ'); ok('регистр: «ЗМЕЯ» = «змея»', r.tiles.length === (await ask('змея')).tiles.length && r.tiles.length > 0);
  r = await ask('венок'); const r2 = await ask('венoк'); ok('ё/е и диакритика: «елка»-тип не падает', true);
  await setLang('fr'); r = await ask('couronne'); ok('FR «couronne» находит', r.tiles.length > 0);
  r = await ask('COURONNE'); ok('FR «COURONNE» (регистр)', r.tiles.length > 0);
  // порядок рангов (RU «вен»): сначала с начала названия
  await setLang('ru'); r = await ask('вен');
  const names = r.tiles.map(t => t.n.toLowerCase()); const rk = n => n.indexOf('вен') === 0 ? 0 : (/(^|[^а-яё])вен/.test(n) ? 1 : 2);
  const ranks = names.map(rk); ok('порядок: начало названия → начало слова → внутри', ranks.length > 0 && ranks.every((x, i) => i === 0 || ranks[i - 1] <= x), ranks.join(''));
  // ничего не найдено
  r = await ask('zzzqqq'); ok('«Мотив не найден» + ссылка', r.nf && /Мотив не найден/.test(r.nfText) && /Искать «zzzqqq» в текстах книг/.test(r.nfText), r.nfText.replace(/\n+/g, ' | '));
  await p.screenshot({ path: path.join(OUT, 'motsearch-notfound.png') });
  const links = await p.$$eval('.ic-mot-nf a', a => a.map(x => [x.textContent, x.getAttribute('href')]));
  ok('ссылки в поиск каждой книги из index.json', links.length === 2 && links[0][1] === '#/iconologie' && links[1][1] === '#/cartari', JSON.stringify(links));
  for (const [i, slug] of [[0, 'iconologie'], [1, 'cartari']]) {
    await p.goto(BASE + '#/motifs'); await W(1500); await setLang('ru'); await ask('zzzqqq');
    await p.evaluate(i => document.querySelectorAll('.ic-mot-nf a')[i].click(), i); await W(2500);
    const inp = await p.evaluate(() => ({ h: location.hash, open: !!document.querySelector('#ic-rb-sheet.open, #ic-rb-sheet[aria-hidden="false"], .ic-rb-sheet.ic-rb-open'), v: (document.querySelector('#ic-rb-sheet .ic-search') || {}).value, vis: (() => { const e = document.querySelector('#ic-rb-sheet'); return e ? getComputedStyle(e).visibility + '/' + Math.round(e.getBoundingClientRect().height) : ''; })() }));
    ok('«Искать в книге» → ' + slug + ': обложка и поиск с запросом', inp.h === '#/' + slug && inp.v === 'zzzqqq', JSON.stringify(inp));
    if (i === 0) await p.screenshot({ path: path.join(OUT, 'motsearch-booksearch.png') });
  }

  // синонимы: подставляем syn в загруженный словарь (данные синонимов не добавляются в репозиторий)
  await p.route('**/books/_motifs/motifs_vocab.json', async route => { const resp = await route.fetch(); const j = await resp.json(); const m = j.motifs.find(x => x.id === 'snake') || j.motifs[0]; m.syn = { ru: ['гадюка'], en: ['viper'], fr: ['vipère'] }; await route.fulfill({ response: resp, json: j }); });
  await p.goto(BASE + '#/motifs'); await W(1500); await setLang('ru');
  r = await ask('гадюк'); ok('по синониму находит и показывает «название · слово» мелко', r.tiles.length === 1 && r.tiles[0].syn === 'гадюка', JSON.stringify(r.tiles));
  await p.screenshot({ path: path.join(OUT, 'motsearch-syn.png') });
  r = await ask('змея'); ok('по названию подсказки синонима нет', r.tiles.length > 0 && r.tiles.every(t => t.syn === ''), JSON.stringify(r.tiles.slice(0, 2)));
  await setLang('en'); r = await ask('vipe'); ok('EN: синоним на любом языке, название на языке интерфейса', r.tiles.length === 1 && r.tiles[0].syn === 'viper' && !/[а-я]/i.test(r.tiles[0].n), JSON.stringify(r.tiles));
  ok('консоль без ошибок', errs.length === 0, errs.join(' | '));
  await br.close(); console.log(bad ? 'FAILED ' + bad : 'OK'); process.exit(bad ? 1 : 0);
})();
