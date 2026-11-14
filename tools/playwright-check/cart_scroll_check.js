/* Картари: шапка и меню остаются на месте при посимвольном вводе в «Найти» под открытой шторкой после глубокой прокрутки
 * (указатель #/cartari/index и имена #/cartari/names). Запуск: BASE=http://localhost:8971/index.html node cart_scroll_check.js */
const { webkit, devices } = require('playwright');
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
    await p.click('.ic-rbar-tvsearch'); await W(800);
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
  if (errs.length) fails.push('console: ' + errs[0]);
  await br.close(); console.log(fails.length ? 'FAIL\n' + fails.join('\n') : 'OK'); process.exit(fails.length ? 1 : 0);
})();
