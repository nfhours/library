/* Картари: шапка и меню остаются на месте при посимвольном вводе в «Найти» под открытой шторкой после глубокой прокрутки
 * (указатель #/cartari/index и имена #/cartari/names). Запуск: BASE=http://localhost:8971/index.html node cart_scroll_check.js */
const { webkit, devices } = require('playwright');
const { audit } = require('./loupe_common.js');
const OUT = require('path').join(__dirname, 'out');
const BASE = process.env.BASE || 'http://localhost:8971/index.html';
const W = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const br = await webkit.launch(); const ctx = await br.newContext({ ...devices['iPhone 13'] }); const p = await ctx.newPage();
  const errs = []; const bn = t => /access control|Load failed|cancelled/i.test(t);
  p.on('pageerror', e => { if (!bn(e.message)) errs.push('pageerror ' + e.message); }); p.on('console', m => { if (m.type() === 'error' && !bn(m.text())) errs.push(m.text()); });
  const fails = [];
  const view = () => p.evaluate(() => { const b = document.querySelector('.ic-booktabs'), r = document.querySelector('.ic-rbar'); if (!b || !r) return 'no header/rbar'; const a = b.getBoundingClientRect(), c = r.getBoundingClientRect();
    return (a.top >= -1 && a.top < 120 && a.height > 30 && c.top >= 0 && c.top < 200 && c.height > 20) ? 'ok' : 'off-screen booktabs=' + Math.round(a.top) + ' rbar=' + Math.round(c.top); });
  for (const [page, word] of [['index', 'аполлон'], ['names', 'юпитер'], ['index', 'zeus'], ['names', 'diana']]) {
    await p.goto(BASE + '#/cartari/' + page); await p.evaluate(() => sessionStorage.clear()); await p.reload(); await W(2500);
    const H = await p.evaluate(() => document.documentElement.scrollHeight);
    await p.evaluate(h => scrollTo(0, h * 0.4), H); await W(300); await p.evaluate(h => scrollTo(0, h * 0.4 + 300), H); await W(900);
    const y = await p.evaluate(() => scrollY);
    const alg = () => p.evaluate(() => { const i = document.querySelector('.ic-rbar-findin'), ci = getComputedStyle(i); return [ci.textAlign, getComputedStyle(i, '::placeholder').color, getComputedStyle(i.parentNode).backgroundColor]; });
    const g0 = await alg(); if (g0[0] !== 'center' || g0[2] !== 'rgba(0, 0, 0, 0)') fails.push(page + ' unfocused ' + g0);
    await p.click('.ic-rbar-findin'); await W(800);
    const g1 = await alg(); if (g1[0] !== 'left' || !/, 0\)$|transparent/.test(g1[1]) || g1[2] === 'rgba(0, 0, 0, 0)') fails.push(page + ' focused ' + g1);
    const inp = p.locator('.ic-rbar-findin'); const bad = []; let rows0 = await p.evaluate(() => document.body.offsetHeight);
    for (const ch of word) { await inp.pressSequentially(ch, { delay: 30 }); await W(60); const v = await view(); if (v !== 'ok') bad.push(ch + ': ' + v); }
    const rows1 = await p.evaluate(() => document.body.offsetHeight);
    console.log(page, word, 'scrollY', y, 'H', H, 'body', rows0, '->', rows1, bad.length ? 'BAD ' + bad.slice(0, 3) : 'ok');
    if (bad.length) fails.push(page + ' ' + word + ' ' + bad[0]);
  }
  // Переход в главу из лупы / указателя / имён: первая отрисованная позиция главы уже у места (нет кадра с y=0), дальше без прыжка
  const frames = () => p.evaluate(() => window.__fr);
  const sampler = () => p.evaluate(() => { window.__fr = []; (function t() { window.__fr.push({ h: location.hash, y: Math.round(scrollY), ch: !!document.querySelector('.ic-ch-body, .ic-ch-wrap') }); requestAnimationFrame(t); })(); });
  const judge = async (name) => {
    await W(3500); const fr = (await frames()).filter(f => /\/ch\//.test(f.h) && f.ch); const ys = fr.map(f => f.y);
    const info = { name, frames: fr.length, first: ys[0], min: Math.min(...ys), max: Math.max(...ys) };
    const bad = !fr.length || ys[0] < 5 || (info.max - info.min) > 6;
    console.log('jump', JSON.stringify(info), bad ? 'BAD' : 'ok'); if (bad) fails.push('chapter jump ' + JSON.stringify(info));
  };
  const fresh = async (h) => { await p.goto(BASE + '#/cartari/' + h); await p.evaluate(() => sessionStorage.clear()); await p.reload(); await W(2500); };
  for (const tab of ['text', 'names', 'index']) {
    await fresh(tab); await sampler();
    await p.click('.ic-bt-search'); await W(500);
    await p.locator('#ic-rb-sheet input.ic-search').pressSequentially('аполлон', { delay: 30 }); await W(2500);
    await p.locator('#ic-rb-sheet .ic-sr-ul a[href*="/ch/"]').first().click(); await judge('loupe from ' + tab);
  }
  await fresh('index'); await p.evaluate(() => scrollTo(0, 6000)); await W(600); await sampler();
  await p.evaluate(() => { const a = [...document.querySelectorAll('.ic-tv-pg a')].find(e => e.getBoundingClientRect().top > 150); a.click(); }); await judge('index link');
  await fresh('names'); await p.evaluate(() => scrollTo(0, 3000)); await W(600);
  await p.evaluate(() => { const a = [...document.querySelectorAll('a.ic-nm-row')].find(e => e.getBoundingClientRect().top > 150); a.click(); }); await W(2500); await sampler();
  await p.evaluate(() => document.querySelector('.ic-nm-ms a').click()); await judge('name card mention');
  // Совпадение по полю, которого нет в строке: мелкая подпись под именем с подсветкой; видимое совпадение — подсветка в строке без подписи
  const setLang = async l => { await p.evaluate(v => localStorage.setItem('ic-lang', v), l); };
  const nameRow = (sel, id) => p.evaluate(([sel, id]) => { const r = [...document.querySelectorAll(sel)].find(a => (a.getAttribute('href') || '').endsWith('names/' + id)); if (!r) return null;
    const c = r.querySelector('.ic-hf'), m = c && c.querySelector('mark'), cs = m && getComputedStyle(m);
    return { name: r.querySelector('.ic-tv-ru').textContent, nameMark: [...r.querySelectorAll('.ic-tv-ru mark')].map(x => x.textContent).join('|'), itMark: [...r.querySelectorAll('.ic-tv-it mark')].map(x => x.textContent).join('|'),
      cap: c ? c.textContent : null, capMark: m ? m.textContent : null, capBg: cs ? cs.backgroundColor : null, capFs: c ? parseFloat(getComputedStyle(c).fontSize) : null, nameFs: parseFloat(getComputedStyle(r.querySelector('.ic-tv-ru')).fontSize), caps: r.querySelectorAll('.ic-hf').length }; }, [sel, id]);
  const typeFind = async q => { await p.click('.ic-rbar-findin'); await p.locator('.ic-rbar-findin').fill(''); await p.locator('.ic-rbar-findin').pressSequentially(q, { delay: 20 }); await W(600); };
  const WARM = 'rgba(214, 150, 96, 0.32)';
  const check = (name, r, exp) => { const bad = !r || Object.keys(exp).some(k => k === 'capBgWarm' ? r.capBg !== WARM : (exp[k] instanceof RegExp ? !exp[k].test(String(r[k])) : r[k] !== exp[k])); console.log('hf', name, bad ? 'BAD ' + JSON.stringify(r) : 'ok'); if (bad) fails.push('hf ' + name + ' ' + JSON.stringify(r)); };
  for (const [lang, q, id, exp, nm] of [
    ['ru', 'apollon', 'apollo', { name: 'Аполлон', cap: 'Apollon', capMark: 'Apollon', capBgWarm: 1, caps: 1 }, 'RU «apollon» → caption Apollon'],
    ['ru', 'аполлон', 'apollo', { nameMark: 'Аполлон', cap: null }, 'RU «аполлон» visible match, no caption'],
    ['ru', 'apollo', 'apollo', { itMark: 'Apollo', cap: null }, 'RU «apollo» matches visible Italian original, highlighted in row, no caption'],
    ['en', 'аполлон', 'apollo', { name: 'Apollo', cap: 'Аполлон', capMark: 'Аполлон', capBgWarm: 1, caps: 1 }, 'EN «аполлон» → Apollo + caption Аполлон'],
    ['fr', 'аполлон', 'apollo', { name: 'Apollon', cap: 'Аполлон', capMark: 'Аполлон' }, 'FR «аполлон» → caption'],
    ['ru', 'авентинск', 'aventino', null, 'RU variant']]) {
    if (!exp) continue;
    await setLang(lang); await fresh('names'); await typeFind(q);
    const r = await nameRow('a.ic-nm-row', id); check('names ' + lang + ' ' + nm, r, exp);
    if (r && r.cap) { const ok2 = r.capFs < r.nameFs; if (!ok2) fails.push('hf caption not smaller ' + JSON.stringify(r)); }
  }
  // вариант написания (v), порядок: язык интерфейса → оригинал → варианты → остальные
  await setLang('en'); await fresh('names'); await typeFind('Авентинск');
  { const r = await p.evaluate(() => { const c = document.querySelector('a.ic-nm-row .ic-hf'); return c ? { cap: c.textContent, mark: c.querySelector('mark') && c.querySelector('mark').textContent, n: document.querySelectorAll('a.ic-nm-row').length } : null; });
    const bad = !r || !/Авентинск/.test(r.cap) || !r.mark; console.log('hf variant', JSON.stringify(r), bad ? 'BAD' : 'ok'); if (bad) fails.push('hf variant ' + JSON.stringify(r)); }
  // лупа Картари, раздел имён: те же поля и тот же показ
  for (const [lang, q, id, exp, nm] of [
    ['ru', 'apollon', 'apollo', { cap: 'Apollon', capMark: 'Apollon', capBgWarm: 1, caps: 1 }, 'RU «apollon»'],
    ['en', 'аполлон', 'apollo', { name: 'Apollo', cap: 'Аполлон', capMark: 'Аполлон', capBgWarm: 1, caps: 1 }, 'EN «аполлон»'],
    ['ru', 'аполлон', 'apollo', { cap: null }, 'RU «аполлон» visible, no caption']]) {
    await setLang(lang); await fresh('text'); await p.click('.ic-bt-search'); await W(500);
    await p.locator('#ic-rb-sheet input.ic-search').pressSequentially(q, { delay: 25 }); await W(2500);
    const r = await nameRow('#ic-rb-sheet a.ic-nm-row', id); check('loupe names ' + nm, r, exp);
  }
  // оформление результатов лупы Картари: изоляция от стилей меню, читаемость, миниатюры, подсветка, совпадение с начала слова
  const loupeOpen = async (lang, q) => { await setLang(lang); await fresh('text'); await p.click('.ic-bt-search'); await W(500); await p.locator('#ic-rb-sheet input.ic-search').pressSequentially(q, { delay: 25 }); await W(2500); };
  for (const [lang, q] of [['ru', 'аполлон'], ['en', 'apollo'], ['fr', 'apollon'], ['ru', 'апол'], ['ru', 'лоно']]) {
    await loupeOpen(lang, q); const a = await audit(p, 'cartari loupe ' + lang + ' ' + q);
    const bad = a.bad.length || a.marks === 0 || (q === 'аполлон' && a.imgs === 0);
    console.log('loupe', a.name, 'items', a.items, 'marks', a.marks, 'imgs', a.imgs, bad ? 'BAD ' + a.bad.slice(0, 4).join(' ; ') : 'ok'); if (bad) fails.push(a.name + ' ' + JSON.stringify(a.bad.slice(0, 4)) + ' marks=' + a.marks);
    if (['аполлон', 'apollo', 'apollon'].includes(q)) {
      await p.evaluate(() => { document.querySelector('#ic-rb-sheet .ic-sr').scrollTop = 0; }); await W(300);
      await p.screenshot({ path: OUT + '/loupe-cartari-' + lang + '-top.png' });
      await p.evaluate(() => { const h = document.getElementById('ic-sr-n') || document.getElementById('ic-sr-i'); if (h) h.scrollIntoView(); }); await W(500);
      await p.screenshot({ path: OUT + '/loupe-cartari-' + lang + '-names.png' });
    }
  }
  // «Найти» в списках — только с начала слова: «поллон» (внутри «Аполлон») не находит ничего, «аполлон» и «апол» находят
  for (const [pg, sel] of [['names', '.ic-nm-row'], ['index', '.ic-tv-e']]) {
    await setLang('ru'); await fresh(pg);
    const cnt = async q => { await typeFind(q); return p.evaluate(s => document.querySelectorAll(s).length, sel); };
    const inside = await cnt('поллон'), full = await cnt('аполлон'), part = await cnt('апол');
    const bad = inside !== 0 || full === 0 || part < full; console.log('find word-start', pg, { inside, full, part }, bad ? 'BAD' : 'ok'); if (bad) fails.push('find word-start ' + pg + JSON.stringify({ inside, full, part }));
  }
  await setLang('ru');
  if (errs.length) fails.push('console: ' + errs[0]);
  await br.close(); console.log(fails.length ? 'FAIL\n' + fails.join('\n') : 'OK'); process.exit(fails.length ? 1 : 0);
})();
